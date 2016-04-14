'use strict';

angular.module('backtestMeanApp')
  .controller('ScenarioCtrl', function($http, $scope, socket, googleChartApiPromise, ChartService, BacktestService, $state, $mdDialog,$mdToast, Auth, usSpinnerService) {
    $scope.isAuthenticated = Auth.isLoggedIn;
    $scope.scenarios = [];
    $scope.errors = {};
    $scope.submitted = false;
    $scope.operatorChoices = ['>','<'];
    $scope.strategyChoices = IndicatorStrategyFactory.getAvailableStrategyChoices();
    $scope.scenario = BacktestService.getInitialScenarioConfiguration();
    $scope.chartObject = {};
   // $scope.chartHelp = $sce.trustAsHtml('Roll mouse on chart to zoom<br>Hold left mouse button to pan left/right<br>Hover over buy/sell tags to view details<br>Click on legend to hide/show chart lines');
    $scope.hideSeries = ChartService.hideSeries;


    // load all scenarios for the currently logged in user during module initialization
    $http.get('/api/scenario').then(response => {
      $scope.scenarios = response.data;
      BacktestService.fixDateFormatIssuesOnAllScenarios($scope.scenarios);
      socket.syncUpdates('scenario',  $scope.scenarios);
    });


    /**
     * Initiate a backtest analysis using the information specified in the
     * user input form
     * @param form : form inputs describe a scenario object
     */
    $scope.analyzeScenario = function(form) {
      if (form.$valid) {
        $scope.startSpin();
        BacktestService.calculate($scope.scenario)
          .then(function(backtestResults){
            googleChartApiPromise.then($scope.chartObject = ChartService.buildChart(backtestResults));
            $scope.scenario.analysisResults = {
              endingInvestment: backtestResults.endingInvestment,
              investmentReturnPercent: backtestResults.investmentReturnPercent,
              annualReturnPercent: backtestResults.annualReturnPercent
            };
            $scope.stopSpin();
          })
          .catch(function(err){
            $scope.stopSpin();
            $mdDialog.show(
              $mdDialog.alert()
                .clickOutsideToClose(true)
                .title('An error occurred while running backtest analysis')
                .textContent(err)
                .ariaLabel(err)
                .ok('OK')
            );
          });
        $scope.submitted = false;
      }else{
        $scope.submitted = true;
        console.log('invalid form');
      }
    };

    /**
     * Utility function that returns true if the chart has been generated
     * @returns {boolean}
       */
    $scope.chartExists = function(){
      return !_.isEmpty($scope.chartObject);
    };

    /**
     * Load all scenarios for the current user
     */
    $scope.loadAllScenarios = function() {
      $http.get('/api/scenario').then(response => {
        $scope.scenarios = response.data;
        BacktestService.fixDateFormatIssuesOnAllScenarios($scope.scenarios);
        socket.syncUpdates('scenario',  $scope.scenarios);
      });
    };


      /**
       * Save the scenario described in the form to the database
       * @param form: form inputs that describe a scenario
       */
    $scope.addScenario = function(form) {
      if (form.$valid) {
        $scope.scenario.owner = Auth.getCurrentUser()._id;
        $http.post('/api/scenario', $scope.scenario);
        BacktestService.fixDateFormatIssues($scope.scenario);
        // loadAllScenarios() is required here because socket.io does not update properly when
        // creating a new scenario from an existing scenario.  Other clients are updated of the change
        // but the client adding the new scenario does not get updated.  I suggest trying to remove
        // loadAllScenarios() to test after socket.io software is updated.
        $scope.loadAllScenarios();
        $scope.submitted = false;
        $scope.showToast('A new scenario for ticker '+ $scope.scenario.ticker + ' has been added to the database');
      }else{
        $scope.submitted = true;
        console.log('invalid form');
      }
    };

    /**
     * Update the existing scenario described in the form to the database
     * @param form : form inputs that describe a scenario
     */
    $scope.updateScenario = function(form) {
      if (form.$valid) {
        $http.put('/api/scenario/'+ $scope.scenario._id, $scope.scenario);
        BacktestService.fixDateFormatIssues($scope.scenario);
        $scope.submitted = false;
        $scope.showToast('Existing scenario for ticker '+ $scope.scenario.ticker + ' has been updated');
      }else{
        $scope.submitted = true;
        console.log('invalid form');
      }
    };

    /**
     * Load the specified scenario and reset associated attributes on the scope
     * in preparation for a subsequent backtest analysis
     * @param scenario
     */
    $scope.loadScenario = function(scenario) {
      $scope.startSpin();
      $scope.scenario = scenario;
      BacktestService.fixDateFormatIssues($scope.scenario);  // required because of an issue with Material datepicker
      $scope.scenario.analysisResults = {};
      $scope.chartObject = '';
      $state.go('scenario');
      $scope.stopSpin();
      $scope.showToast('Scenario for ticker '+ $scope.scenario.ticker + ' has been loaded');
    };

    /**
     * Delete the specified scenario from the database
     * @param scenario
     */
    $scope.deleteScenario = function(scenario) {
      $http.delete('/api/scenario/' + scenario._id);
      $scope.showToast('Scenario for ticker '+ $scope.scenario.ticker + ' has been DELETED from the database');
    };

    /**
     * Create and return a text description for the specified trade trigger
     * @param trigger
     * @returns {string}
     */
    $scope.getTriggerDesc = function(trigger){
      return trigger.indicator1.name + trigger.operator + trigger.indicator2.name;
    };

    /**
     * Create and return a text summary description of a scenario
     * @param scenario
     * @returns {string} : description of scneario
     */
    $scope.getDesc = function(scenario){
      return scenario.ticker + ' buy when '+ $scope.getTriggerDesc(scenario.buyTrigger) + ' sell when '+ $scope.getTriggerDesc(scenario.sellTrigger);
    };

    /**
     * Create and return a text label summary of backtesting return on investment
     * @param scenario
     * @returns string : text summary of backtesting return on investment
     */
    $scope.getAnalysisReturnLabel = function(scenario){
      if(scenario.analysisResults && scenario.analysisResults.annualReturnPercent) {
        return _.round(scenario.analysisResults.annualReturnPercent, 1) + '%';
      }
      else {
        return 'NA';
      }
    };

    /**
     * Create and return a more detailed description of the backtesting return on investment
     * @param scenario
     * @returns : text description of backtesting analysis return on investment
     */
    $scope.getAnalysisReturnDesc = function(scenario){
      if(scenario.analysisResults && scenario.analysisResults.annualReturnPercent) {
        return 'Investment return of ' + _.round(scenario.analysisResults.investmentReturnPercent, 1) + '% with projected annual ROR of ' + _.round(scenario.analysisResults.annualReturnPercent, 1) + '%';
      }
      else {
        return 'analysis not executed';
      }
    };

    /**
     * Pop up a dialog that lists previously run scenarios for the current user
     * @param ev
     */
    $scope.showScenariosPickList = function(ev) {
      $mdDialog.show({
        controller: ModalController,
        bindToController: true,
        controllerAs: 'ModalCtrl',
        templateUrl: 'app/scenario/scenario.list.modal.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:false,
        locals: {
          ScenarioCtrl: $scope
        }
      });

    };

    /**
     * Controller used by the modal for pop up list of previous scenarios
     * @param $scope
     * @param $mdDialog
     * @constructor
     */
    function ModalController($scope, $mdDialog) {
      $scope.loadScenarioFromDialog = function(scenario) {
        $mdDialog.hide();
        $scope.ModalCtrl.ScenarioCtrl.loadScenario(scenario);
        return scenario;
      };
      $scope.hide = function() {
        $mdDialog.hide();
      };
      $scope.cancel = function() {
        $mdDialog.cancel();
      };
    }

    /**
     * Display the specified toast to the user display
     * @param msg : message to be displayed
     */
    $scope.showToast = function(msg) {
      $mdToast.show(
        $mdToast.simple()
          .textContent(msg)
          .position('top right')
          .hideDelay(3000)
      );
    };

    /**
     * Start the spinner in the scenario form
     */
    $scope.startSpin = function(){
      usSpinnerService.spin('spinner-scenario');
    }
    /**
     * Stop the spinner in the scenario form
     */
    $scope.stopSpin = function(){
      usSpinnerService.stop('spinner-scenario');
    }

    /**
     * Disconnect from SocketIO
     * (this is important ... do not remove)
     */
    $scope.$on('$destroy', function() {
      socket.unsyncUpdates('scenario');
    });


  });
