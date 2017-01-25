(function () {
  'use strict';

  angular
    .module('users')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  // Configuring the Users module
  function menuConfig(menuService) {
    menuService.addMenuItem('drawer', {
      title: 'Users',
      state: 'admin.users.list',
      icon: 'people',
      position: 5,
      roles: ['admin']
    });
  }
}());
