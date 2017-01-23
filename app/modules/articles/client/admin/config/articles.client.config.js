(function () {
  'use strict';

  angular
    .module('articles')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Add the dropdown list item
    menuService.addMenuItem('drawer', {
      title: 'Articles',
      state: 'admin.articles.list',
      icon: 'insert_drive_file',
      position: 4,
      roles: ['admin']
    });
  }
}());
