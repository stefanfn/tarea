#!/usr/bin/node

const
    fs = require('fs'),
    http = require('http');

let origin;

function onPostData(postEvent, data = '') {
    console.log('onPostData', data && data.length);
    postEvent.postData = (postEvent.postData || '') + data;
}

function respond(request, response, config = {}) {
    let httpCode = config.httpCode || 200;
    let headers = {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': origin || 'http://localhost:4200',
        'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS'
    };
    if (httpCode === 200 && config.content) {
        headers['Content-Type'] = config.contentType || 'text/html';
    }

    if (httpCode > 0) {
        response.writeHead(httpCode, headers);
    }

    if (config.content) {
        response.write(config.content);
    }

    if (config.endResponse === undefined || config.endResponse === true) {
        response.end();
    }
}

function start(config) {
    console.log('port', config.port);
    http.createServer((request, response) => {
        origin = config.origin;

        let responder = respond.bind(this, request, response);
        let fcUpper = (part) => { return part ? part[0].toUpperCase() + part.substring(1) : '' };
        let method = request.method;
        let referer = request.headers.referer;
        let [path, paramString] = request.url.split('?');

        console.log('incoming', method);
        let functionName = method.toLowerCase() + (path || '').split('/').map(fcUpper).join('');

        let parameters = {};
        (paramString || '').split('&').map(
          (part) => {
            let [key, value] = part.split('=');
            parameters[key] = value;
          }
        );

        if ('OPTIONS' !== method && !config[functionName]) {
            console.error('unhandled request function', functionName);
            responder({httpCode: 400});
            return;
        }
        switch (method) {
            case 'GET':
                if (referer && config.referers.indexOf(referer) < 0) {
                    console.error('wrong referer', referer);
                    responder({httpCode: 400});
                    return;
                }

                config[functionName](parameters)
                    .then((result) => {
                        responder({content: JSON.stringify(result)});
                    });
                break;
            case 'PUT':
            case 'POST':
                let postEvent = {response, service: path};
                fs.appendFile('onPostData.txt', '', function() {});
                request.on('data', onPostData.bind(this, postEvent));
                request.on(
                    'end',
                    () => {
                        config[functionName](postEvent.postData)
                            .then((result) => {
                                console.log('result', result);
                                responder({content: JSON.stringify(result)});
                            });
                    }
                );
                break;
            case 'OPTIONS':
                responder({});
                break;
            default:
                responder({httpCode: 400});
        }
    }).listen(config.port);
}

module.exports = {
    start
};

