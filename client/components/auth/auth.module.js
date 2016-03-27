'use strict';

angular.module('backtestMeanApp.auth', [
  'backtestMeanApp.constants',
  'backtestMeanApp.util',
  'ngCookies',
  'ui.router'
])
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  });
