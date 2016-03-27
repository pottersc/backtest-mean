/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import User from '../api/user/user.model';

User.findOne({name: 'guest'}, function(err,user){
  if(!user){
    console.log('create guest account');
    User.createAsync({
      provider: 'local',
      name: 'guest',
      email: 'guest@example.com',
      password: 'guest',
      canEdit: false
    });
  }
});

User.findOne({name: 'admin'}, function(err,user){
  if(!user){
    console.log('create admin account (change password)');
    User.createAsync({
      provider: 'local',
      role: 'admin',
      name: 'admin',
      email: 'admin@example.com',
      password: 'admin'    // default password should be changed ASAP
    });
  }
});


