'use strict';

/**
 *  The calculations for the various backtesting strategies are managed using the 'Factory'
 *  pattern and the 'Strategy' pattern.  This approach allows new strategies to be supported with
 *  zero required changes outside of this file.  The steps required to add a new Backtesting Strategy are:
 *  1) create a new strategy class which extends IndicatorStrategy and imjplements a 'calculate' method
 *  2) define new strategy in the 'getAvailableStrategyChoices' method
 *  3) Add support for new strategy in the 'IndicatorStrategyFactory' class
 */


/**
 * Factory class that creates the appropriate indicator strategy class
 * depending on the strategy 'type' that is passed into the constructor
 */
class IndicatorStrategyFactory {
  constructor(type, value1){
    switch(type) {
      case 'CLOSE':
        this.strategy = new ClosingPriceStrategy(type);
        break;
      case 'SMA':
        this.strategy = new MovingAverageStrategy(type, value1);
        break;
      case 'EMA':
        this.strategy = new ExponentialMovingAverageStrategy(type, value1);
        break;
      case 'FIX':
        this.strategy = new FixedValueStrategy(type, value1);
        break;
      default:
        this.strategy = new ClosingPriceStrategy(type);
    }
  }

  /**
   * Return a list of available backtesting strategy choices.  The strategy 'type' must match
   * one of the types listed in the IndicatorStrategyFactory class.
   * @returns {*[]}
   */
  static getAvailableStrategyChoices(){
    return [
      {type: 'SMA', label: 'Moving Average', value1: 0, value1Label: 'Period', value2: 0, value2Label: ''},
      {type: 'EMA', label: 'Exp Moving Average', value1: 0, value1Label: 'Period', value2: 0, value2Label: ''},
      {type: 'FIX', label: 'Fixed Value', value1: 0, value1Label: ' ', value2: 0, value2Label: ''},
      {type: 'CLOSE', label: 'Closing Price', value1: 0, value1Label: '', value2: 0, value2Label: ''}
    ];
  }

  /**
   * Calculate the indicator strategy value for each day in the specified list of tradeDays
   * @param tradeDays : list of trading days objects
   * @returns {*}
   */
  calculate(tradeDays){
    return this.strategy.calculate(tradeDays);
  }

  /**
   * Return the name of the strategy
   * @returns {*}
   */
  getName(){
    return this.strategy.getName();
  }
}

/**
 * This is a base class and should be extended by all indicator strategy implementations.
 * It defines some generic methods that can be used by all strategy implementations
 */
class IndicatorStrategy {
  constructor(type) {
    this.type = type;
  }

  /**
   * This is just a placeholder.  It must be overridden by each indicator strategy implementation
   * @param tradeDays: list of tradeDay objects
   */
  calculate(tradeDays){
  }

  /**
   * find and return the indicator strategy value for a specific tradeDay
   * @param tradeDays : array of tradeDay objects
   * @param index : index of the tradeDay object of interest
   * @param strategyDesc : identifier of a strategy implementation (ex 'SMA(50)' or 'FIX(35.5)' or 'CLOSE')
   * @returns {number} : value of the specified strategy for the specified tradeDay
   */
  getIndicatorValue(tradeDays, index, strategyDesc){
    let indicatorValue = 0;
    if(index>0){
      let tradeDay = tradeDays[index];
      let indicator =  _.findLast(tradeDay.indicators,['name',strategyDesc]);
      indicatorValue = indicator.value;
    }
    return indicatorValue;
  }

  /**
   * find and return the closing stock price for a specific tradeDay
   * @param tradeDays : array of tradeDay objects
   * @param index : index of tradeDay to be accessed
   * @returns {number} : stokc price
   */
  getPrice(tradeDays, index){
    let price = 0;
    if(index>=0){
      let tradeDay = tradeDays[index];
      price = tradeDay.price;
    }
    return price;
  }

  /**
   * return the name of the indicator strategy
   * @returns : name of the indicator strategy implementation
   */
  getName(){
    return this.name;
  }
}


/**
 * Simple Moving Average implementation of an IndicatorStrategy
 * Basically just the average of the previous N days
 */
class MovingAverageStrategy extends IndicatorStrategy {
  constructor(type, period){
    super(type);
    this.period = period;
    this.name = type+'('+period+')';
  }

  /**
   * Calculate the simple moving average for each day in the array of tradeDays.
   * This implementation was done such that the calculations are achieved in a
   * single pass through all the tradeDay objects.  A running sum of previous
   * 'period' days is maintained by adding in the latest day and removing the
   * (i - period) days stock price.
   * @param tradeDays: array of tradeDay objects
   */
  calculate(tradeDays){
    let self = this;
    let sum = 0;
    for(let i=0;i < tradeDays.length;i++){
      let currentTradeDay =  tradeDays[i];
      sum += currentTradeDay.price;
      if(i>this.period-1){
        sum -= this.getPrice(tradeDays,(i - this.period));
      }
      let currentMovingAverage = (sum)/this.period;
      let dayIndicator = {name: self.name, value: currentMovingAverage};
      currentTradeDay.indicators.push(dayIndicator);
    }
  }
}



/**
 * Fixed Value implementation of an IndicatorStrategy
 * Very simple strategy that has the same fixed value limit set
 * for each trade day
 */
class FixedValueStrategy extends IndicatorStrategy{
  constructor(type, fixedValue){
    super(type);
    this.name = type+'('+fixedValue+')';
    this.fixedValue = fixedValue;
  }

  /**
   * Set the value for every trade day to be the fixed price
   * specified by the user
   * @param tradeDays : array of tradeDay objects
   */
  calculate(tradeDays){
    let self = this;
    _.each(tradeDays, function(tradeDay){
      let dayIndicator = {name: self.name, value: self.fixedValue};
      tradeDay.indicators.push(dayIndicator);
    });
  }
}

/**
 * Closing Price implementation of an IndicatorStrategy
 */
class ClosingPriceStrategy extends IndicatorStrategy{
  constructor(type){
    super(type);
    this.name = type;
  }
  /**
   * Set the value for each trade day to be the associated day's
   * closing price
   * @param tradeDays : array of tradeDay objects
   */
  calculate(tradeDays){
    let self = this;
    _.each(tradeDays, function(tradeDay){
      let dayIndicator = {name: self.name, value: tradeDay.price};
      tradeDay.indicators.push(dayIndicator);
    });
  }
}

/**
 * Exponential Moving Average implementation of an IndicatorStrategy
 */
class ExponentialMovingAverageStrategy extends IndicatorStrategy {
  constructor(type, period){
    super(type);
    this.period = period;
    this.name = type+'('+period+')';
  }

  /**
   * EMA is calculated using algorithm outlined at
   * http://www.iexplain.org/ema-how-to-calculate/
   * This implementation was done such that the calculations are achieved in a
   * single pass through all the tradeDay objects.  A running sum of previous
   * 'period' days is maintained by adding in the latest day and removing the
   * (i - period) days stock price.
   * @param tradeDays
     */
  calculate(tradeDays){
    let self = this;
    let sum = 0;
    let yesterdayEMA = 0;
    let k = 2 / (this.period + 1);
    let oneMinusK = 1-k;
    for(let i=0;i < tradeDays.length;i++){
      let currentTradeDay =  tradeDays[i];
      sum += currentTradeDay.price;
      if(i>this.period-1){
        sum -= this.getPrice(tradeDays,i-this.period);
      }
      if(i===this.period){
        yesterdayEMA = ((sum)/this.period)* oneMinusK;
      }
      let currentEMA = (currentTradeDay.price * k) + yesterdayEMA * oneMinusK;
      let dayIndicator = {name: self.name, value: currentEMA};
      currentTradeDay.indicators.push(dayIndicator);
      yesterdayEMA = currentEMA;
    }
  }


}
