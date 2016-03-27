'use strict';

/**
 * Service class for backtest tool
 */
class BacktestService {
  constructor(HistoricalQuotesService){
    this.HistoricalQuotesService = HistoricalQuotesService;
  }

  /**
   * Calculate a complete backtest analysis for the specified scenario
   * @param scenario
   * @returns {Promise}
   */
  calculate(scenario){
    var HistoricalQuotesService = this.HistoricalQuotesService;
    return new Promise(function(resolve, reject) {
      let quotesStartDate = new Date(scenario.start);
      // recommend to generalize daysPrior calculation as a future enhancement
      let daysPrior = Math.max(scenario.buyTrigger.indicator1.value1, scenario.buyTrigger.indicator2.value1, scenario.sellTrigger.indicator1.value1, scenario.sellTrigger.indicator2.value1) + 10;
      quotesStartDate.setDate(scenario.start.getDate() - daysPrior);
      HistoricalQuotesService.getQuotes(scenario.ticker, quotesStartDate, scenario.end)
        .then(function (quotes) {
          let backtestResults = new BacktestResults();
          backtestResults.runBacktestAnalysis(quotes,scenario);
          resolve(backtestResults);
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }

  /**
   * Return the default configuration for a scenario which will initialize the user input form
   * @returns : default scenario configuration
   */
  getInitialScenarioConfiguration() {
    return {
      ticker: 'AAPL',
      start: new Date(2010, 1, 1),
      end: new Date(),
      startingInvestment: 10000,
      transactionCost: 10,
      buyTrigger: {
        indicator1: {
          name: 'tbd',
          type: 'SMA',
          value1: 20,
          value2: 0
        },
        operator: '>',
        indicator2: {
          name: 'tbd',
          type: 'SMA',
          value1: 50,
          value2: 0
        }
    },
      sellTrigger: {
        indicator1: {
          name: 'tbd',
          type: 'SMA',
          value1: 20,
          value2: 0
        },
        operator: '<',
        indicator2: {
          name: 'tbd',
          type: 'SMA',
          value1: 50,
          value2: 0
        }
      }
    };
  }

  /**
   * Convert scenario start end end dates into true Date objects
   * if they are not already date objects.
   * This is necessary because the Angular Material datePicker fails
   * when the date retured from server is a String.  This issue is currently being
   * addressed by the Angular Material team and so this hack should not be
   * required in the future.
   * @param scenarios
     */
  fixDateFormatIssuesOnAllScenarios(scenarios){
    let self = this;
    _.each(scenarios, function(scenario){
      self.fixDateFormatIssues(scenario);
    });
  }

  fixDateFormatIssues(scenario){
    scenario.start = this.convertDateStringToDate(scenario.start);
    scenario.end = this.convertDateStringToDate(scenario.end);
  }

  /**
   * Helper function for fixDateFormatIssues which does the actual conversion
   * from Date string to Date object ... but only if necessary and appropriate
   * @param value : date string
   * @returns { Date}
     */
  convertDateStringToDate(value){
    if (value && !(value instanceof Date)) {
      if (typeof value === 'string')
        value = new Date(value);
    }
    return value;
  }

}
angular.module('backtestMeanApp')
  .service('BacktestService', BacktestService);


