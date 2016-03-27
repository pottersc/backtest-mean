'use strict';

angular.module('backtestMeanApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('scenario', {
        url: '/scenario',
        templateUrl: 'app/scenario/scenario.run.html',
        controller: 'ScenarioCtrl',
        controllerAs: 'vm'
      });
  });
