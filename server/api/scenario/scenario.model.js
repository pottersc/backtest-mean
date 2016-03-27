'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));

var TechnicalIndicatorSchema = new mongoose.Schema({
  name: {type: String},    // ex: SMA(20)
  type: {type: String, required: true}, // ex: SMA
  value1: Number, // ex 20
  value2: Number  // often not used
});

var TriggerSchema = new mongoose.Schema({
  indicator1: {type: TechnicalIndicatorSchema, required:true},  // ex Closing price = $50.25
  operator: {type: String, required: true},   // ['>','<']
  indicator2: {type: TechnicalIndicatorSchema, required:true},   // ex Simple Moving Average with period of 20 days
});

var AnalysisResultsSchema = new mongoose.Schema({
  endingInvestment: {type: Number},
  investmentReturnPercent: {type: Number},
  annualReturnPercent: {type: Number}
});

var ScenarioSchema = new mongoose.Schema({
  owner: {               // User who entered the scenario
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  ticker: {type: String, required: true},   // ex: AAPL, IBM ...
  start: {type: Date, required: true},
  end: {type: Date, required: true},
  startingInvestment: {type: Number, required: true},
  transactionCost: {type: Number, required: true},
  buyTrigger: {type: TriggerSchema, required:true},
  sellTrigger: {type: TriggerSchema, required:true},
  analysisResults: {type: AnalysisResultsSchema}
});

export default mongoose.model('Scenario', ScenarioSchema);
