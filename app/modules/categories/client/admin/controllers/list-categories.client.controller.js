(function () {
  'use strict';

  angular
    .module('categories')
    .controller('CategoriesListController', CategoriesListController);

  CategoriesListController.$inject = ['$timeout', '$mdDialog', '$state', '$scope', '$filter', '$location', 'CategoriesService'];

  function CategoriesListController($timeout, $mdDialog, $state, $scope, $filter, $location, CategoriesService) {
    var bookmark;

    var vm = this;

    vm.selected = [];

    vm.filter = {
      options: {
        debounce: 500
      }
    };

    var defaultQuery = {
      name: '',
      limit: 10,
      sort: 'path',
      page: 1
    };

    vm.query = Object.assign(Object.create(defaultQuery), $location.search());

    function success(categories) {
      vm.categories = categories;
    }

    // vm.addItem = function (event) {
    //   $mdDialog.show({
    //     clickOutsideToClose: true,
    //     controller: 'addItemController',
    //     controllerAs: 'ctrl',
    //     focusOnOpen: false,
    //     targetEvent: event,
    //     templateUrl: 'templates/add-item-dialog.html'
    //   }).then(vm.getCategories);
    // };

    vm.delete = function (event) {
      $mdDialog.show({
        clickOutsideToClose: true,
        controller: 'deleteController',
        controllerAs: 'ctrl',
        focusOnOpen: false,
        targetEvent: event,
        locals: {
          categories: vm.selected
        },
        templateUrl: 'templates/delete-dialog.html'
      }).then(vm.getCategories);
    };

    vm.getCategories = function () {
      var params = {};

      for (var prop in vm.query) {
        if (defaultQuery.hasOwnProperty(prop)) {
          if (defaultQuery[prop] !== vm.query[prop]) params[prop] = vm.query[prop];
        } else {
          params[prop] = vm.query[prop];
        }
      }

      $location.path($location.path()).search(params);
      vm.promise = CategoriesService.query(vm.query, success).$promise;
    };

    vm.removeFilter = function () {
      vm.filter.show = false;
      vm.query.name = '';

      if (vm.filter.form.$dirty) {
        vm.filter.form.$setPristine();
      }
    };

    vm.showFilter = function () {
      vm.filter.show = true;
      $timeout(function () {
        angular.element(document.querySelectorAll('.focusNameImput')).focus();
      });
    };

    $scope.$watch('vm.query.name', function (newValue, oldValue) {
      if (!oldValue) {
        bookmark = vm.query.page;
      }

      if (newValue !== oldValue) {
        vm.query.page = 1;
      }

      if (!newValue) {
        vm.query.page = bookmark;
      }

      vm.getCategories();
    });

    vm.getCategories();
  }
}());
