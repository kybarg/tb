(function () {
  'use strict';

  angular
    .module('vendors')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('vendors', {
        abstract: true,
        url: '/vendors',
        template: '<ui-view/>'
      })
      .state('vendors.list', {
        url: '',
        templateUrl: 'modules/vendors/client/views/list-vendors.client.view.html',
        controller: 'VendorsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Vendors List'
        }
      })
      .state('vendors.create', {
        url: '/create',
        templateUrl: 'modules/vendors/client/views/form-vendor.client.view.html',
        controller: 'VendorsController',
        controllerAs: 'vm',
        resolve: {
          vendorResolve: newVendor
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Vendors Create'
        }
      })
      .state('vendors.edit', {
        url: '/:vendorId/edit',
        templateUrl: 'modules/vendors/client/views/form-vendor.client.view.html',
        controller: 'VendorsController',
        controllerAs: 'vm',
        resolve: {
          vendorResolve: getVendor
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Vendor {{ vendorResolve.name }}'
        }
      })
      .state('vendors.view', {
        url: '/:vendorId',
        templateUrl: 'modules/vendors/client/views/view-vendor.client.view.html',
        controller: 'VendorsController',
        controllerAs: 'vm',
        resolve: {
          vendorResolve: getVendor
        },
        data: {
          pageTitle: 'Vendor {{ vendorResolve.name }}'
        }
      });
  }

  getVendor.$inject = ['$stateParams', 'VendorsService'];

  function getVendor($stateParams, VendorsService) {
    return VendorsService.get({
      vendorId: $stateParams.vendorId
    }).$promise;
  }

  newVendor.$inject = ['VendorsService'];

  function newVendor(VendorsService) {
    return new VendorsService();
  }
}());
