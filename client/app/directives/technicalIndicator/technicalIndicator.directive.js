'use strict';

angular.module('backtestMeanApp')
  .directive('technicalIndicator', function () {
    return {
      restrict: 'E',  // only match element name
      templateUrl: 'app/directives/technicalIndicator/technicalIndicator.html',
      scope: {
          indicator: '=',
          strategyChoices: '=',
          type: '=',
          desc: "@desc"
      },
      link: function(scope) {
        scope.getStrategy = function(strategyType, strategyChoices){
          var strategy = null;
          for(var i=0;i < strategyChoices.length; i++){
            if(strategyChoices[i].type == strategyType){
              strategy = strategyChoices[i];
            }
          }
          return strategy;
        };
      }
    };
  });
