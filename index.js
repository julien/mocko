#!/usr/bin/env node
'use strict';

var http = require('http');
var os = require('os');
var gaze = require('gaze');
var io = require('./io');
var file = process.argv[2];
var port = process.argv[3] ? process.argv[3] : 8000;
var server;

if (!file) {
  console.error('You need to specify a file path');
  process.exit(1);
}

function sendReponse(res, data) {
  var key;

  if (!res || !data) return;

  if (data.body) {
    if (data.headers) {
      for (key in data.headers) {
        if (data.headers.hasOwnProperty(key)) {
          res.setHeader(key, data.headers[key]);
        }
      }
    } else {
      res.setHeader('Content-type', 'application/json');
    }

    // Add cache headers (30 days)
    var age = 30 * 24 * 60 * 60 * 1000;
    res.setHeader('Cache-Control', 'public, max-age=' + age);
    res.setHeader('Expires', new Date(Date.now() + age).toUTCString());

    res.statusCode = data.statusCode ? data.statusCode : 200;
    res.end(JSON.stringify(data.body));
  }
}

function requestListener(req, res) {
  var  data = io.get(req.url);

  if (!data) {
    res.writeHead(404);
    res.end('');
    return;
  }
  sendReponse(res, data);
}

function initServer(httpPort) {
  server = http.createServer(requestListener)
    .on('error', function (err) {
      if (err.code === 'EACCES' || err.code === 'EADDRINUSE') {
        console.log('Failed, starting server');
        process.exit(1);
      }
    }).on('listening', function () {
      console.log('Server listening on httpPort', httpPort);
      console.log(' Hit <C-c> to exit.');
    }).listen(httpPort);
}

io.map(file)
  .then(initServer(port))
  .catch(function (err) {
    console.error('File not found');
    process.exit(1);
  });

gaze(file, function (err, watcher) {
  watcher.on('changed', function () {
    console.log('Routes changed');
    io.map(filepath).then(function () {
      console.log('Routes reloaded');
    });
  });
});

process.on('uncaughtException', function (err) {
  console.log('Uncaught Exception:%s %s', os.EOL, err.stack);
});

process.on('SIGINT', function () {
  if (server) server.close();
  process.exit(1);
});
