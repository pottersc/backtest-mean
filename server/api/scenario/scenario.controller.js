/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/scenario              ->  index
 * POST    /api/scenario              ->  create
 * GET     /api/scenario/:id          ->  show
 * PUT     /api/scenario/:id          ->  update
 * DELETE  /api/scenario/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import Scenario from './scenario.model';
import HistoricalQuotesService from '../historicalQuotes/historicalQuotes.service';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function saveUpdates(updates) {
  return function(entity) {
    var updated = _.merge(entity, updates);
    return updated.saveAsync()
      .spread(updated => {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.removeAsync()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Scenarios
export function index(req, res) {
  console.log("controller:show");
  let start = new Date(2010, 1, 1);
  let end = new Date();
  let ticker = 'AAPL';
  //HistoricalQuotesService.getQuotes(ticker, start, end)
  //  .then(function (quotes) {
  //    console.log('------------------------');
  //    console.log(quotes);
  //  //  let backtestResults = new BacktestResults();
  //  //  backtestResults.runBacktestAnalysis(quotes,scenario);
  //  //  resolve(backtestResults);
  //  })
  //  .catch(function (err) {
  //    reject(err);
  //  });



  HistoricalQuotesService.getQuotes('AAPL',start,end);
  Scenario.findAsync({'owner': req.user._id})
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Scenario from the DB
export function show(req, res) {
  Scenario.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Scenario in the DB
export function create(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Scenario.createAsync(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Scenario in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Scenario.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Scenario from the DB
export function destroy(req, res) {
  Scenario.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
