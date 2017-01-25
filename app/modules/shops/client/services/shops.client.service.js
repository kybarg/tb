// Shops service used to communicate Shops REST endpoints
(function () {
  'use strict';

  angular
    .module('shops')
    .factory('ShopsService', ShopsService);

  ShopsService.$inject = ['$resource'];

  function ShopsService($resource) {
    return $resource('api/shops/:shopId', {
      shopId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
