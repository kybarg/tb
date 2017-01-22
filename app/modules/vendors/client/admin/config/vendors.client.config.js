(function () {
  'use strict';

  angular
    .module('vendors')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('drawer', {
      title: 'Vendors',
      state: 'admin.vendors.list',
      icon: 'folder',
      roles: ['admin']
    });
  }
}());
