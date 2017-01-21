(function () {
  'use strict';

  angular
    .module('categories')
    .controller('CategoriesListController', CategoriesListController);

  CategoriesListController.$inject = ['$timeout', '$location', 'CategoriesService'];

  function CategoriesListController($timeout, $location, CategoriesService) {

    var vm = this;

    vm.categories = {};

    vm.options = {
      rowSelection: true,
      multiSelect: true,
      autoSelect: true,
      decapitate: false,
      largeEditDialog: false,
      boundaryLinks: false,
      limitSelect: true,
      pageSelect: true
    };

    vm.selected = [];
    vm.limitOptions = [10, 20, 50, {
      label: 'All',
      value: function () {
        return vm.categories.items ? vm.categories.count : 0;
      }
    }];

    vm.query = {
      order: 'name',
      limit: 10,
      page: 1
    };

    vm.promise = getCategories();

    vm.onPaginate = function (page, limit) {
      console.log('Scope Page: ' + vm.query.page + ' Scope Limit: ' + vm.query.limit);
      console.log('Page: ' + page + ' Limit: ' + limit);
      vm.promise = getCategories(vm.query);
    };

    vm.deselect = function (item) {
      console.log(item.name, 'was deselected');
    };

    vm.log = function (item) {
      console.log(item.name, 'was selected');
    };

    vm.loadStuff = function () {
      vm.promise = $timeout(function () {

      }, 2000);
    };

    vm.onReorder = function (order) {

      console.log('Scope Order: ' + vm.query.order);
      console.log('Order: ' + order);


      vm.promise = $timeout(function () {

      }, 2000);
    };

    function getCategories(params) {
      params = params ? params : {};

      return CategoriesService.getCategories(params)
      .then(function (categories) {
        vm.categories = categories;
        $location.path($location.path()).search(params);
      })
      .catch(function(response) {
        console.dir(response);
      })
    }

    // var bookmark;

    // var vm = this;
    // vm.selected = [];
    // vm.categories = getCategories;
    // // vm.remove = remove;

    // vm.filter = {
    //   options: {
    //     debounce: 500
    //   }
    // };

    // vm.defaultQuery = {
    //   name: '',
    //   limit: 10,
    //   sort: 'path',
    //   page: 1
    // };

    // vm.query = Object.assign(Object.create(vm.defaultQuery), $location.search());



    // function success(categories) {
    //   vm.categories = categories;
    // }

    // // vm.addItem = function (event) {
    // //   $mdDialog.show({
    // //     clickOutsideToClose: true,
    // //     controller: 'addItemController',
    // //     controllerAs: 'ctrl',
    // //     focusOnOpen: false,
    // //     targetEvent: event,
    // //     templateUrl: 'templates/add-item-dialog.html'
    // //   }).then(vm.getCategories);
    // // };

    // // function remove(event) {
    // //   $mdDialog.show({
    // //     clickOutsideToClose: true,
    // //     controller: 'deleteController',
    // //     controllerAs: 'ctrl',
    // //     focusOnOpen: false,
    // //     targetEvent: event,
    // //     locals: {
    // //       categories: vm.selected
    // //     },
    // //     templateUrl: 'templates/delete-dialog.html'
    // //   }).then(vm.getCategories);
    // // };

    // function getCategories() {
    //   var params = {};

    //   for (var prop in vm.query) {
    //     if (defaultQuery.hasOwnProperty(prop)) {
    //       if (defaultQuery[prop] !== vm.query[prop]) params[prop] = vm.query[prop];
    //     } else {
    //       params[prop] = vm.query[prop];
    //     }
    //   }

    //   $location.path($location.path()).search(params);
    //   vm.promise = CategoriesService.query(vm.query).$promise;
    // };

    // vm.removeFilter = function () {
    //   vm.filter.show = false;
    //   vm.query.name = '';

    //   if (vm.filter.form.$dirty) {
    //     vm.filter.form.$setPristine();
    //   }
    // };

    // vm.showFilter = function () {
    //   vm.filter.show = true;
    //   $timeout(function () {
    //     angular.element(document.querySelectorAll('.focusNameImput')).focus();
    //   });
    // };

    // // $scope.$watchCollection('vm.query.name', function (newValue, oldValue) {
    // //   if (!oldValue) {
    // //     bookmark = vm.query.page;
    // //   }

    // //   if (newValue !== oldValue) {
    // //     vm.query.page = 1;
    // //   }

    // //   if (!newValue) {
    // //     vm.query.page = bookmark;
    // //   }

    // //   vm.getCategories();
    // // });

    // // vm.getCategories();
  }
} ());
