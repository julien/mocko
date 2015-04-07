#!/usr/bin/env node
'use strict';

var http = require('http');
var fs = require('fs');
var os = require('os');
var path = require('path');
var gaze = require('gaze');
var io = require('./io');
var file = process.argv[2];
var port = process.argv[3] ? process.argv[3] : 8000;
// Base directory for the ".json" file
var baseDir = path.dirname(file);
var server;
// Common headers
var headers;


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

    if (typeof data.body === 'string') {
      var fp = path.resolve(baseDir, data.body);
      io.check(fp).then(function (path) {
        fs.createReadStream(path).pipe(res);
      }, function () {
        res.writeHead(404);
        res.end('');
      });
    } else {
      res.end(JSON.stringify(data.body));
    }
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
        console.log('Failed, starting server');;
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
    io.map(file).then(function () {
      console.log('Routes reloaded');
    });
  });
});

process.on('SIGINT', function () {
  if (server) server.close();
  process.exit(1);
});
