'use strict';

describe('Controller: ScenarioCtrl', function () {

  // load the controller's module
  beforeEach(module('backtestMeanApp'));

  var ScenarioCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ScenarioCtrl = $controller('ScenarioCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
