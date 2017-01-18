(function () {
  'use strict';

  angular
    .module('core')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {

    menuService.addMenuItem('drawer', {
      title: 'Home',
      icon: 'home',
      state: 'admin.home',
      roles: ['admin']
    });

    menuService.addMenu('account', {
      roles: ['user']
    });

    menuService.addMenuItem('account', {
      title: '',
      state: 'admin.settings',
      type: 'dropdown',
      roles: ['user']
    });

    menuService.addSubMenuItem('account', 'admin.settings', {
      title: 'Edit Profile',
      state: 'admin.settings.profile'
    });

    menuService.addSubMenuItem('account', 'admin.settings', {
      title: 'Edit Profile Picture',
      state: 'admin.settings.picture'
    });

    menuService.addSubMenuItem('account', 'admin.settings', {
      title: 'Change Password',
      state: 'admin.settings.password'
    });

    menuService.addSubMenuItem('account', 'admin.settings', {
      title: 'Manage Social Accounts',
      state: 'admin.settings.accounts'
    });

    menuService.addSubMenuItem('account', 'admin.settings', {
      title: 'Manage Social Accounts',
      state: 'admin.settings.accounts'
    });
  }
}());
