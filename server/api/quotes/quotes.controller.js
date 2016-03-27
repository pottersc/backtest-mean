/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/quotes              ->  index
 */

'use strict';

import _ from 'lodash';
import HistoricalQuotesService from '../historicalQuotes/historicalQuotes.service';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Quotes
export function index(req, res) {
  return HistoricalQuotesService.getQuotes(req.query.ticker, req.query.start, req.query.end)
    .then(respondWithResult(res))
    .catch(handleError(res));
}



