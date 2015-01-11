'use strict';

var Promise = require('bluebird');
var fs = require('fs');
var routes = {};

exports.map = function (file) {

  return new Promise(function (resolve, reject) {
    var rs = fs.createReadStream(file);
    var buf = [];

    rs.on('error', function (err) {
      reject(err);
    });

    rs.on('data', function (chunk) {
      buf.push(chunk.toString());
    });

    rs.on('end', function () {
      try {
        routes = JSON.parse(buf.join(''));
        resolve(routes);
      } catch (e) {
        reject(e);
      }
    });
  });
};

exports.get = function (url) {
  return routes[url];
};

exports.all = function (fn) {
  var i = 0, l = routes.length;

  for (; i < l; i++) {
    if (fn && typeof fn === 'function') {
      fn(routes[i]);
    }
  }

  return routes;
};

exports.check = function (filepath) {
  return new Promise(function (resolve, reject) {
    fs.exists(filepath, function (exists) {
      if (exists) resolve(filepath);
      else reject(exists);
    });
  });
};

