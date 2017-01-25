(function () {
  'use strict';

  angular
    .module('categories')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {

    menuService.addMenuItem('drawer', {
      title: 'Женщине',
      iconSvg: '/modules/categories/client/all/img/icons/ic_face_female_black_24px.svg',
      state: 'all.categories.view',
      params: {
        categoryId: "587d567edb6d077eb9c891a3"
      },
      roles: ['*']
    });

    menuService.addMenuItem('drawer', {
      title: 'Мужчине',
      iconSvg: '/modules/categories/client/all/img/icons/ic_face_male_black_24px.svg',
      state: 'all.categories.list',
      roles: ['*']
    });

    menuService.addMenuItem('drawer', {
      title: 'Девочке',
      iconSvg: '/modules/categories/client/all/img/icons/ic_face_girl_black_24px.svg',
      state: 'all.categories.list',
      roles: ['*']
    });

    menuService.addMenuItem('drawer', {
      title: 'Мальчику',
      iconSvg: '/modules/categories/client/all/img/icons/ic_face_boy_black_24px.svg',
      state: 'all.categories.list',
      roles: ['*']
    });

    menuService.addMenuItem('drawer', {
      title: 'Малышам',
      iconSvg: '/modules/categories/client/all/img/icons/ic_face_baby_black_24px.svg',
      state: 'all.categories.list',
      roles: ['*']
    });

    // menuService.addMenuItem('drawer', {
    //   title: 'Categories',
    //   state: 'categories',
    //   roles: ['*']
    // });

    // // Set top bar menu items
    // menuService.addMenuItem('topbar', {
    //   title: 'Categories',
    //   state: 'categories',
    //   type: 'dropdown',
    //   roles: ['*']
    // });

    // // Add the dropdown list item
    // menuService.addSubMenuItem('topbar', 'categories', {
    //   title: 'List Categories',
    //   state: 'categories.list',
    //   roles: ['*']
    // });
  }
}());
