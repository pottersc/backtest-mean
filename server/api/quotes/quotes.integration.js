'use strict';

var app = require('../..');
import request from 'supertest';


describe('Quotes API:', function() {

  describe('GET /api/quotes', function() {
    var quotess;

    beforeEach(function(done) {
      request(app)
        .get('/api/quotes')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          quotess = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      quotess.should.be.instanceOf(Array);
    });

  });



});
