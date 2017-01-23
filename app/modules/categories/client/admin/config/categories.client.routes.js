(function () {
  'use strict';

  angular
    .module('categories.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.categories', {
        abstract: true,
        url: '/categories',
        template: '<ui-view/>'
      })
      .state('admin.categories.list', {
        url: '',
        templateUrl: '/modules/categories/client/admin/views/list-categories.client.view.html',
        controller: 'CategoriesListController',
        controllerAs: 'vm',
        // views: {
        //   '@': {
        //     templateUrl: '/modules/categories/client/admin/views/list-categories.client.view.html',
        //     controller: 'CategoriesListController',
        //     controllerAs: 'vm'
        //   },
        //   'tabs@': {
        //     template: '<div>sdfsdfsdgsdfg</div>'
        //   }
        // },
        data: {
          pageTitle: 'Categories',
          roles: ['admin']
        },
        // resolve: {
        //   categoriesResolve: getCategories
        // }
      })
      .state('admin.categories.create', {
        url: '/create',
        templateUrl: '/modules/categories/client/admin/views/form-category.client.view.html',
        controller: 'CategoriesController',
        controllerAs: 'vm',
        data: {
          back: true,
          pageTitle: 'New Category',
          roles: ['admin']
        },
        resolve: {
          categoryResolve: newCategory
        }
      })
      .state('admin.categories.edit', {
        url: '/:categoryId/edit',
        templateUrl: '/modules/categories/client/admin/views/form-category.client.view.html',
        controller: 'CategoriesController',
        controllerAs: 'vm',
        data: {
          back: true,
          pageTitle: 'Edit Category',
          roles: ['admin']
        },
        resolve: {
          categoryResolve: getCategory
        }
      });
  }

  getCategory.$inject = ['$stateParams', 'CategoriesService'];

  function getCategory($stateParams, CategoriesService) {
    return CategoriesService.get({
      categoryId: $stateParams.categoryId
    }).$promise;
  }

  getCategories.$inject = ['CategoriesService'];

  function getCategories(CategoriesService) {
    return CategoriesService.query().$promise;
  }

  newCategory.$inject = ['CategoriesService'];

  function newCategory(CategoriesService) {
    return new CategoriesService();
  }
} ());
