'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var scenarioCtrlStub = {
  index: 'scenarioCtrl.index',
  show: 'scenarioCtrl.show',
  create: 'scenarioCtrl.create',
  update: 'scenarioCtrl.update',
  destroy: 'scenarioCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var scenarioIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './scenario.controller': scenarioCtrlStub
});

describe('Scenario API Router:', function() {

  it('should return an express router instance', function() {
    scenarioIndex.should.equal(routerStub);
  });

  describe('GET /api/scenario', function() {

    it('should route to scenario.controller.index', function() {
      routerStub.get
        .withArgs('/', 'scenarioCtrl.index')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/scenario/:id', function() {

    it('should route to scenario.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'scenarioCtrl.show')
        .should.have.been.calledOnce;
    });

  });

  describe('POST /api/scenario', function() {

    it('should route to scenario.controller.create', function() {
      routerStub.post
        .withArgs('/', 'scenarioCtrl.create')
        .should.have.been.calledOnce;
    });

  });

  describe('PUT /api/scenario/:id', function() {

    it('should route to scenario.controller.update', function() {
      routerStub.put
        .withArgs('/:id', 'scenarioCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('PATCH /api/scenario/:id', function() {

    it('should route to scenario.controller.update', function() {
      routerStub.patch
        .withArgs('/:id', 'scenarioCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('DELETE /api/scenario/:id', function() {

    it('should route to scenario.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'scenarioCtrl.destroy')
        .should.have.been.calledOnce;
    });

  });

});
