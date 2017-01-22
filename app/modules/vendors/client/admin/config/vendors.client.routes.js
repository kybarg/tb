(function () {
  'use strict';

  angular
    .module('vendors.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.vendors', {
        abstract: true,
        url: '/vendors',
        template: '<ui-view/>'
      })
      .state('admin.vendors.list', {
        url: '',
        templateUrl: '/modules/vendors/client/admin/views/list-vendors.client.view.html',
        controller: 'VendorsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Vendors List'
        }
      })
      .state('admin.vendors.create', {
        url: '/create',
        templateUrl: '/modules/vendors/client/admin/views/form-vendor.client.view.html',
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
      .state('admin.vendors.edit', {
        url: '/:vendorId/edit',
        templateUrl: '/modules/vendors/client/admin/views/form-vendor.client.view.html',
        controller: 'VendorsController',
        controllerAs: 'vm',
        resolve: {
          vendorResolve: getVendor
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Vendor {{ vendorResolve.name }}'
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
