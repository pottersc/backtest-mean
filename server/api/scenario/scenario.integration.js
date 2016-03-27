'use strict';

var app = require('../..');
import request from 'supertest';

var newScenario;

describe('Scenario API:', function() {

  describe('GET /api/scenario', function() {
    var scenarios;

    beforeEach(function(done) {
      request(app)
        .get('/api/scenario')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          scenarios = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      scenarios.should.be.instanceOf(Array);
    });

  });

  describe('POST /api/scenario', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/scenario')
        .send({
          name: 'New Scenario',
          info: 'This is the brand new scenario!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newScenario = res.body;
          done();
        });
    });

    it('should respond with the newly created scenario', function() {
      newScenario.name.should.equal('New Scenario');
      newScenario.info.should.equal('This is the brand new scenario!!!');
    });

  });

  describe('GET /api/scenario/:id', function() {
    var scenario;

    beforeEach(function(done) {
      request(app)
        .get('/api/scenario/' + newScenario._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          scenario = res.body;
          done();
        });
    });

    afterEach(function() {
      scenario = {};
    });

    it('should respond with the requested scenario', function() {
      scenario.name.should.equal('New Scenario');
      scenario.info.should.equal('This is the brand new scenario!!!');
    });

  });

  describe('PUT /api/scenario/:id', function() {
    var updatedScenario;

    beforeEach(function(done) {
      request(app)
        .put('/api/scenario/' + newScenario._id)
        .send({
          name: 'Updated Scenario',
          info: 'This is the updated scenario!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedScenario = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedScenario = {};
    });

    it('should respond with the updated scenario', function() {
      updatedScenario.name.should.equal('Updated Scenario');
      updatedScenario.info.should.equal('This is the updated scenario!!!');
    });

  });

  describe('DELETE /api/scenario/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/scenario/' + newScenario._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when scenario does not exist', function(done) {
      request(app)
        .delete('/api/scenario/' + newScenario._id)
        .expect(404)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });

});
