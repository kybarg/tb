(function () {
  'use strict';

  angular
    .module('shops')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Shops',
      state: 'shops',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'shops', {
      title: 'List Shops',
      state: 'shops.list'
    });

    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'shops', {
      title: 'Create Shop',
      state: 'shops.create',
      roles: ['user']
    });
  }
}());
