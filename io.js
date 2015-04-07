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
  var key;
  var reg;
  var route;
  for (key in routes) {
    if (routes.hasOwnProperty(key) && key !== '*') {
      reg = new RegExp(key, 'ig');
      if (reg.exec(url)) {
        route = routes[key];
        if (routes['*'] && !route.hasOwnProperty('headers')) {
          route.headers = routes['*'].headers;
        }
        return route;
      }
    }
  }
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

