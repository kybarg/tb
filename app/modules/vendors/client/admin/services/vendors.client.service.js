// Vendors service used to communicate Vendors REST endpoints
(function () {
  'use strict';

  angular
    .module('vendors.services')
    .factory('VendorsService', VendorsService);

  VendorsService.$inject = ['$resource'];

  function VendorsService($resource) {
    return $resource('/api/vendors/:vendorId', {
      vendorId: '@_id'
    }, {
      update: {
        method: 'PUT'
      },
      query: {
        method: 'GET',
        isArray: false
      }
    });
  }
}());
