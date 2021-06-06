#!/usr/bin/node

const debug = false;
const sqlite3 = require('sqlite3').verbose();
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
    debug && console.log('get', all);

    return prepareDatabase().then(queryTasks.bind(this, all));
}

function getCreate(parameters) {
    return prepareDatabase().then(createTask).then(queryTasks);
}

function prepareDatabase() {
    debug && console.log('prepareDatabase', prepareDatabasePromise);

    return prepareDatabasePromise = prepareDatabasePromise || database.exec(`
        CREATE TABLE IF NOT EXISTS ${tableName}
        (
            task_id INTEGER PRIMARY KEY AUTOINCREMENT,
            text text NOT NULL,
            lasts int NOT NULL,
            done_on date
        )
    `);
}

function put(data) {
    debug && console.log('put', data);

    return prepareDatabase()
        .then(markTaskDone.bind(this, data.task))
        .then(queryTasks);
}

function putUpdate(config) {
    debug && console.log('putUpdate', config);

    return prepareDatabase()
        .then(updateTask.bind(this, config.task))
        .then(queryTasks.bind(this, 'true' === config.all));
}

function queryTasks(all) {
    debug && console.log('queryTasks');

    return database.all(`
        SELECT task_id, text, date(coalesce(done_on, '1970-01-01'), lasts || ' days') AS due, lasts
        FROM ${tableName}
    ` + (all ? '' : `WHERE due <= date('now', '+7 days')`)
    );
}

function markTaskDone(taskId) {
    debug && console.log('markTaskDone', taskId);

    return database.run(
      `UPDATE ${tableName} SET done_on = date('now') WHERE task_id = ?`, taskId
    );
}

function updateTask(task) {
    debug && console.log('updateTask', task);

    return database.run(
      `UPDATE ${tableName} SET text = ?, lasts = ?, done_on = date(?, '-' || ? || ' days') WHERE task_id = ?`,
      task.text,
      task.lasts,
      task.due,
      task.lasts,
      task.task_id
    );
}

open({
    filename: '/app/tarea.db',
    driver: sqlite3.Database
}).then((db) => {
    database = db;

    httpcoolmule.start({
        origin: 'http://tarea.coolmule.de',
        referers: ['http://localhost:4200/', 'http://localhost:42956/', 'http://tarea.coolmule.de/'],
        port,
        get: (parameters) => {
            return get(parameters.all === 'true')
        },
        getCreate,
        put: (putEvent) => {
            return put(JSON.parse(putEvent));
        },
        putUpdate: (postData) => {
            return putUpdate(JSON.parse(postData));
        },
    });
});
