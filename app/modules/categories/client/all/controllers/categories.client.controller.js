(function () {
  'use strict';

  // Categories controller
  angular
    .module('categories')
    .controller('CategoriesController', CategoriesController);

  CategoriesController.$inject = ['$scope', '$state', '$window', 'Authentication', 'categoryResolve', 'CategoriesService'];

  function CategoriesController ($scope, $state, $window, Authentication, category, CategoriesService) {
    var vm = this;

    vm.authentication = Authentication;
    vm.category = category;
    vm.error = null;

    console.dir(category);

    vm.children = CategoriesService.query({
      parent: category._id
    });

    console.dir(vm.children);
  }
}());
