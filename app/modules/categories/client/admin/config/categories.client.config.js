(function () {
  'use strict';

  angular
    .module('categories')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('drawer', {
      title: 'Categories',
      state: 'admin.categories.list',
      icon: 'folder',
      position: 1,
      roles: ['admin']
    });
  }
}());
