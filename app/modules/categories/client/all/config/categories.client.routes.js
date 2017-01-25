(function () {
  'use strict';

  angular
    .module('categories.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('all.categories', {
        abstract: true,
        url: '/categories',
        template: '<ui-view/>'
      })
      .state('all.categories.list', {
        url: '',
        templateUrl: '/modules/categories/client/all/views/list-categories.client.view.html',
        controller: 'CategoriesListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Categories List'
        }
      })
      .state('all.categories.view', {
        url: '/:categoryId',
        templateUrl: '/modules/categories/client/all/views/view-category.client.view.html',
        controller: 'CategoriesController',
        controllerAs: 'vm',
        resolve: {
          categoryResolve: getCategory
        },
        data: {
          pageTitle: '{{ categoryResolve.name }}'
        }
      });
  }

  getCategory.$inject = ['$stateParams', 'CategoriesService'];

  function getCategory($stateParams, CategoriesService) {
    return CategoriesService.get({
      categoryId: $stateParams.categoryId
    }).$promise;
  }
}());
