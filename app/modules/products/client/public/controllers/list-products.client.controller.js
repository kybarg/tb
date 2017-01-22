(function () {
  'use strict';

  angular
    .module('products')
    .controller('ProductsListController', ProductsListController);

  ProductsListController.$inject = ['ProductsService'];

  function ProductsListController(ProductsService) {
    var vm = this;

    vm.products = ProductsService.query();
  }
}());
