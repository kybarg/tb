(function () {
  'use strict';

  angular
    .module('vendors')
    .controller('VendorsListController', VendorsListController);

  VendorsListController.$inject = ['VendorsService'];

  function VendorsListController(VendorsService) {
    var vm = this;

    vm.vendors = VendorsService.query();
  }
}());
