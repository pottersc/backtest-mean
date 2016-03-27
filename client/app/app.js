'use strict';

angular.module('backtestMeanApp', [
  'backtestMeanApp.auth',
  'backtestMeanApp.admin',
  'backtestMeanApp.constants',
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'btford.socket-io',
  'ui.router',
  'ui.bootstrap',
  'validation.match',
  'ngMaterial',
  'ngMessages',
  'googlechart'
])
  .config(function($urlRouterProvider, $locationProvider, $mdThemingProvider) {
    // used below to try to enable cross site scripting
    //, $httpProvider
    //$httpProvider.defaults.useXDomain = true;
    //delete $httpProvider.defaults.headers.common['X-Requested-With'];

    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);

    $mdThemingProvider.theme('default');
      //.primaryPalette('pink')
      //.accentPalette('orange');
  });

