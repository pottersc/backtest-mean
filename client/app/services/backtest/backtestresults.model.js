'use strict';

/**
 * Class that runs a backtest analysis for a single scenario and manages
 * the results
 */
class BacktestResults {

  constructor() {
    this.MILLISECONDS_PER_DAY = (1000 * 3600 * 24);
    this.DAYS_PER_YEAR = 365;
    this.tradeDays = [];
    this.availableIndicatorNames = [];
    this.endingInvestment = 0;
    this.investmentReturnPercent = 0;
    this.annualReturnPercent = 0;
  }

  /**
   * Run a backtest analysis for the specified parameters and then calculate some summary results
   * that are stored in the BacktestResults class
   * @param quotes : array of historical stock quotes
   * @param scenario : object containing all the input parameters required to run an analysis
   */
  runBacktestAnalysis(quotes, scenario){
    this.loadHistoricalQuotes(quotes);
    this.calculateAllTradeIndicators(scenario);
    this.removeOutOfRangeTradeDays(this.tradeDays, scenario.start, scenario.end);
    this.executeTradeAnalysis(scenario);
    this.endingInvestment = _.last(this.tradeDays).investmentValue;
    let profit = this.endingInvestment - scenario.startingInvestment;
    this.investmentReturnPercent = (profit) / 100;
    this.annualReturnPercent = _.round((profit / (this.getDaysBetween(scenario.start, scenario.end) / this.DAYS_PER_YEAR))/100, 1);
  }

  /**
   * Calculate and return the number of days between two dates
   * @param date1
   * @param date2
   * @returns : number of days between date1 and date2
   */
  getDaysBetween(date1,date2){
    let timeDiff = Math.abs(date2.getTime() - date1.getTime());
    let daysDiff = Math.ceil(timeDiff / this.MILLISECONDS_PER_DAY);
    return daysDiff;
  }

  /**
   * Execute a trade analysis for the specified scenario
   * For each trade day calculate the buySignal and sellSignal
   * and then assess if a trade should be executed.
   * Trading is not enabled until a sellSignal exists for the first time.
   * This insures that a clean initial buy is executed on the leading
   * edge of a initial buySignal
   * @param scenario: scenario object containing all user inputs
   */
  executeTradeAnalysis(scenario){
    let self = this;
    let investableCash = scenario.startingInvestment;
    let numSharesOwned = 0;
    let tradingEnabled = false;
    _.each(self.tradeDays, function(tradeDay){
      let buySignal = self.isTradeTriggerActive(tradeDay, scenario.buyTrigger);
      let sellSignal = self.isTradeTriggerActive(tradeDay, scenario.sellTrigger);
      if((sellSignal || !buySignal) && !tradingEnabled){
        tradingEnabled = true;
      }
      self.assessAndExecuteTradeForSingleTradeDay(tradeDay, tradingEnabled, buySignal, sellSignal, numSharesOwned, investableCash, scenario.transactionCost);
      numSharesOwned = tradeDay.numSharesOwned;
      investableCash = tradeDay.investableCash;
    });
  }

  /**
   * Determine if a trade is warranted for the specified day and execute the trade if appropriate
   * @param tradeDay : tradeDay being evaluated
   * @param tradingEnabled : flag that dictates if trading is even enabled yet
   * @param buySignal : boolean indicating if buySignal is active
   * @param sellSignal : boolean indicating if sellSignal is active
   * @param numSharesOwned : number of shares currently owned
   * @param investableCash : amount of investable cash currently available
   * @param transactionCost : cost per transaction
   */
  assessAndExecuteTradeForSingleTradeDay(tradeDay, tradingEnabled, buySignal, sellSignal, numSharesOwned, investableCash, transactionCost){
     if(tradingEnabled && buySignal && (numSharesOwned <= 0) && (investableCash > transactionCost) ) {
      tradeDay.action = 'BUY';
      tradeDay.numSharesOwned = (investableCash - transactionCost) / tradeDay.price;
      tradeDay.investableCash = 0;
      tradeDay.numSharesTraded = tradeDay.numSharesOwned;
    }else if(tradingEnabled && sellSignal && (numSharesOwned > 0)) {
      tradeDay.action = 'SELL';
      tradeDay.investableCash = numSharesOwned * tradeDay.price;
      tradeDay.investableCash = tradeDay.investableCash - transactionCost;
      tradeDay.numSharesTraded = numSharesOwned;
      tradeDay.numSharesOwned = 0;
    }else if(numSharesOwned <= 0) {
      tradeDay.action = 'NONE';
      tradeDay.numSharesOwned = 0;
      tradeDay.numSharesTraded = 0;
      tradeDay.investableCash = investableCash;
    }else {
      tradeDay.action = 'HOLD';
      tradeDay.numSharesOwned = numSharesOwned;
      tradeDay.numSharesTraded = 0;
      tradeDay.investableCash = investableCash;
    }
    tradeDay.investmentValue = (tradeDay.numSharesOwned * tradeDay.price) + tradeDay.investableCash;
  }

  /**
   * Determine if the specified trade trigger is active for the specified tradeDay
   * @param tradeDay : trade day to be assessed
   * @param trigger : trigger object
   * @returns {boolean} :
   */
  isTradeTriggerActive(tradeDay, trigger){
    let activeStatus = false;
    let indicator1 = _.findLast(tradeDay.indicators,['name',trigger.indicator1.name]);
    let indicator2 = _.findLast(tradeDay.indicators,['name',trigger.indicator2.name]);
    if(trigger.operator==='>' && indicator1.value > indicator2.value){
      activeStatus = true;
    }
    if(trigger.operator==='<' && indicator1.value < indicator2.value){
      activeStatus = true;
    }
    return activeStatus;
  }

  /**
   * Create a list of tradeDay object from the passed in list of stock quotes
   * @param quotes : array of historical stock quotes
   */
  loadHistoricalQuotes(quotes){
    let self = this;
    self.tradeDays = [];
    _.each(quotes, function(quote){
      let tradeDay = {date: quote.date, price: quote.price, indicators: []};
      self.tradeDays.push(tradeDay);
    });
  }

  /**
   * Calculate all the trade day indicators for all of the specified triggers
   * @param scenario
   */
  calculateAllTradeIndicators(scenario){
    this.calculateTradeIndicator(scenario.buyTrigger.indicator1);
    this.calculateTradeIndicator(scenario.buyTrigger.indicator2);
    this.calculateTradeIndicator(scenario.sellTrigger.indicator1);
    this.calculateTradeIndicator(scenario.sellTrigger.indicator2);
  }

  /**
   * Calculate the tradeDay indicator for a specific indicator
   * @param indicator
   */
  calculateTradeIndicator(indicator){
    let self = this;
    let indicatorStrategy = new IndicatorStrategyFactory(indicator.type,indicator.value1, indicator.value2);
    if(_.indexOf(self.availableIndicatorNames,indicatorStrategy.getName())<0){
      indicatorStrategy.calculate(self.tradeDays);
      self.availableIndicatorNames.push(indicatorStrategy.getName());
    }
    indicator.name = indicatorStrategy.getName();
  }

  /**
   * Remove trade days that do not fall within the analysis time period
   * @param tradeDays
   * @param start
   * @param end
   */
  removeOutOfRangeTradeDays(tradeDays, start, end){
    // A reverse traversal of the array is used to avoid an array
    // length corruption error that occurs when removing elements
    // while processing array in forward direction
    for (let i = tradeDays.length - 1; i >= 0; i--) {
      let tradeDay = tradeDays[i];
      if(tradeDay.date<start || tradeDay.date>end){
        tradeDays.splice(i, 1);
      }
    }
  }


}
