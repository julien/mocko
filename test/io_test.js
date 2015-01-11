'use strict';

var assert = require('assert')
  , io = require('../io');

describe('io', function () {

  it('should be loaded from a .json file', function (done) {
    io.map('./test/fixtures/api.json').then(function () {
      var all = io.all();
      assert.notDeepEqual(all, undefined);
      done();
    });
  });

  it('should contain the routes from the .json file', function (done) {
    io.map('./test/fixtures/api.json').then(function () {
      var all = io.all();
      assert.notDeepEqual(all, undefined);
      assert.notDeepEqual(all['/api/1'], undefined);
      assert.notDeepEqual(all['/api/2'], undefined);
      done();
    });
  });

  it('should filter a route', function (done) {
    io.map('./test/fixtures/api.json').then(function () {
      assert.notDeepEqual(io.get('/api/2'), undefined);
      assert.deepEqual(io.get('/non-existing'), undefined);
      done();
    });
  });

});
