(function () {
  'use strict';

  angular
    .module('shops')
    .controller('ShopsListController', ShopsListController);

  ShopsListController.$inject = ['ShopsService'];

  function ShopsListController(ShopsService) {
    var vm = this;

    vm.shops = ShopsService.query();
  }
}());
