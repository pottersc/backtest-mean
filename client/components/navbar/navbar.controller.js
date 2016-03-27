'use strict';

class NavbarController {
  //start-non-standard
  menu = [{
    'title': 'Welcome',
    'state': 'main'
  },{
    'title': "Run Analysis",
    'state': 'scenario'
  },{
    'title': "About",
    'state': 'about'
  },{
    'title': "Contact",
    'state': 'contact'
  }];

  isCollapsed = true;
  //end-non-standard

  constructor(Auth) {
    this.isLoggedIn = Auth.isLoggedIn;
    this.isAdmin = Auth.isAdmin;
    this.getCurrentUser = Auth.getCurrentUser;
  }
}

angular.module('backtestMeanApp')
  .controller('NavbarController', NavbarController);
