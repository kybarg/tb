(function () {
  'use strict';

  angular
    .module('products')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Add the dropdown list item
    menuService.addMenuItem('drawer', {
      title: 'Products',
      state: 'admin.products.list',
      icon: 'local_mall',
      position: 2,
      roles: ['admin']
    });
  }
}());
