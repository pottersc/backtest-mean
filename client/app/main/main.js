'use strict';

angular.module('backtestMeanApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('main', {
        url: '/',
        templateUrl: 'app/main/main.html'
      })
      .state('about', {
        url: '/about',
        templateUrl: 'app/main/about.html'
      })
      .state('contact', {
        url: '/contact',
        templateUrl: 'app/main/contact.html'
      });
  });
