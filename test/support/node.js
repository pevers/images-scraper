'use strict'

var chai = require('chai')
  , chaiAsPromised = require('chai-as-promised')
  , Promise = require('bluebird');

chai.should();
chai.use(chaiAsPromised);

global.fulfilledPromise = Promise.resolve;
global.rejectPromise = Promise.reject;
global.defer = Promise.defer;
global.waitAll = Promise.all;