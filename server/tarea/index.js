#!/usr/bin/node

const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const httpcoolmule = require('./httpcoolmule');
const tableName = 'task';
const port = process.env.TAREA_PORT || 42956; // H A Z L O

var database;

let prepareDatabasePromise;

function createTask() {
    return database.exec(`
        INSERT INTO ${tableName} (text, lasts) VALUES ('Neue Aufgabe', 7)
    `);
}

function get(all) {
    return prepareDatabase().then(queryTasks.bind(this, all));
}

function getCreate(parameters) {
    return prepareDatabase().then(createTask).then(queryTasks);
}

function prepareDatabase() {
    return prepareDatabasePromise = prepareDatabasePromise || database.exec(
        'CREATE TABLE IF NOT EXISTS ' + tableName +
        ' (' +
            'task_id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
            'text text NOT NULL, ' +
            'lasts int NOT NULL, ' +
            'done_on date' +
        ')'
    );
}

function put(data) {
    console.log('put', data);

    return prepareDatabase()
        .then(markTaskDone.bind(this, data.task))
        .then(queryTasks);
}

function queryTasks(all) {
    return database.all(`
        SELECT task_id, text, date(coalesce(done_on, '1970-01-01'), lasts || ' days') AS due, lasts
        FROM ${tableName}` +
        all ? '' : `
        WHERE due <= date('now', '+7 days')
    `);
}

function markTaskDone(taskId) {
    console.log('markTaskDone', taskId);
    return database.exec(`UPDATE ${tableName} SET done_on = date('now') WHERE task_id = ${taskId}`);
}

open({
    filename: './tarea.db',
    driver: sqlite3.Database
}).then((db) => {
    database = db;

    httpcoolmule.start({
        referers: ['http://localhost:4200/', 'http://localhost:42956/'],
        port,
        get: (parameters) => {
            return get(parameters.all === 'true')
        },
        getCreate,
        put: (putEvent) => {
            return put(JSON.parse(putEvent.postData));
        }
    });
});
