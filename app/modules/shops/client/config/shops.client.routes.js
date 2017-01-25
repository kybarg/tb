(function () {
  'use strict';

  angular
    .module('shops')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('shops', {
        abstract: true,
        url: '/shops',
        template: '<ui-view/>'
      })
      .state('shops.list', {
        url: '',
        templateUrl: 'modules/shops/client/views/list-shops.client.view.html',
        controller: 'ShopsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Shops List'
        }
      })
      .state('shops.create', {
        url: '/create',
        templateUrl: 'modules/shops/client/views/form-shop.client.view.html',
        controller: 'ShopsController',
        controllerAs: 'vm',
        resolve: {
          shopResolve: newShop
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Shops Create'
        }
      })
      .state('shops.edit', {
        url: '/:shopId/edit',
        templateUrl: 'modules/shops/client/views/form-shop.client.view.html',
        controller: 'ShopsController',
        controllerAs: 'vm',
        resolve: {
          shopResolve: getShop
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Shop {{ shopResolve.name }}'
        }
      })
      .state('shops.view', {
        url: '/:shopId',
        templateUrl: 'modules/shops/client/views/view-shop.client.view.html',
        controller: 'ShopsController',
        controllerAs: 'vm',
        resolve: {
          shopResolve: getShop
        },
        data: {
          pageTitle: 'Shop {{ shopResolve.name }}'
        }
      });
  }

  getShop.$inject = ['$stateParams', 'ShopsService'];

  function getShop($stateParams, ShopsService) {
    return ShopsService.get({
      shopId: $stateParams.shopId
    }).$promise;
  }

  newShop.$inject = ['ShopsService'];

  function newShop(ShopsService) {
    return new ShopsService();
  }
}());
