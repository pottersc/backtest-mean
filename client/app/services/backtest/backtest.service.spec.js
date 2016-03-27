'use strict';

describe('Service: backtest', function () {

  // load the service's module
  beforeEach(module('backtestMeanApp'));

  // instantiate service
  var backtest;
  beforeEach(inject(function (_backtest_) {
    backtest = _backtest_;
  }));

  it('should do something', function () {
    expect(!!backtest).toBe(true);
  });

});
