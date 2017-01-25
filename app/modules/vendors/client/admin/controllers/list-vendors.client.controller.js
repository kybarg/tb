(function () {
  'use strict';

  angular
    .module('vendors')
    .controller('VendorsListController', VendorsListController);

  VendorsListController.$inject = ['$timeout', '$location', 'VendorsService', '$stateParams'];

  function VendorsListController($timeout, $location, VendorsService, $stateParams) {
    var vm = this;

    vm.vendors = {};
    vm.selected = [];

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

    vm.filter = {
      options: {
        debounce: 500
      }
    };

    vm.limitOptions = [10, 20, 50, {
      label: 'All',
      value: function () {
        return vm.vendors.items ? vm.vendors.count : 0;
      }
    }];

    vm.query = {
      order: 'name',
      limit: 10,
      page: 1
    };

    angular.extend(vm.query, $location.search());

    vm.promise = getVendors(vm.query);

    vm.onPaginate = function (page, limit) {
      console.log('Scope Page: ' + vm.query.page + ' Scope Limit: ' + vm.query.limit);
      console.log('Page: ' + page + ' Limit: ' + limit);
      vm.promise = getVendors(vm.query);
    };

    vm.deselect = function (item) {
      console.log(item.name, 'was deselected');
    };

    vm.log = function (item) {
      console.log(item.name, 'was selected');
    };

    vm.search = function () {
      vm.promise = getVendors(vm.query);
    };

    vm.onReorder = function (order) {

      console.log('Scope Order: ' + vm.query.order);
      console.log('Order: ' + order);


      vm.promise = $timeout(function () {

      }, 2000);
    };

    function getVendors() {
      return VendorsService.getVendors(vm.query)
      .then(function (vendors) {
        vm.vendors = vendors;
        $location.path($location.path()).search(vm.query);
      })
      .catch(function(response) {
        console.dir(response);
      })
    }

    // var bookmark;

    // var vm = this;
    // vm.selected = [];
    // vm.vendors = getVendors;
    // // vm.remove = remove;

    // vm.defaultQuery = {
    //   name: '',
    //   limit: 10,
    //   sort: 'path',
    //   page: 1
    // };

    // vm.query = Object.assign(Object.create(vm.defaultQuery), $location.search());



    // function success(vendors) {
    //   vm.vendors = vendors;
    // }

    // // vm.addItem = function (event) {
    // //   $mdDialog.show({
    // //     clickOutsideToClose: true,
    // //     controller: 'addItemController',
    // //     controllerAs: 'ctrl',
    // //     focusOnOpen: false,
    // //     targetEvent: event,
    // //     templateUrl: 'templates/add-item-dialog.html'
    // //   }).then(vm.getVendors);
    // // };

    // // function remove(event) {
    // //   $mdDialog.show({
    // //     clickOutsideToClose: true,
    // //     controller: 'deleteController',
    // //     controllerAs: 'ctrl',
    // //     focusOnOpen: false,
    // //     targetEvent: event,
    // //     locals: {
    // //       vendors: vm.selected
    // //     },
    // //     templateUrl: 'templates/delete-dialog.html'
    // //   }).then(vm.getVendors);
    // // };

    // function getVendors() {
    //   var params = {};

    //   for (var prop in vm.query) {
    //     if (defaultQuery.hasOwnProperty(prop)) {
    //       if (defaultQuery[prop] !== vm.query[prop]) params[prop] = vm.query[prop];
    //     } else {
    //       params[prop] = vm.query[prop];
    //     }
    //   }

    //   $location.path($location.path()).search(params);
    //   vm.promise = VendorsService.query(vm.query).$promise;
    // };

    vm.removeFilter = function () {
      vm.filter.show = false;
      vm.query.name = '';

      // if (vm.filter.form.$dirty) {
      //   vm.filter.form.$setPristine();
      // }
    };

    vm.showFilter = function () {
      vm.filter.show = true;
      $timeout(function () {
        angular.element(document.querySelectorAll('.focusNameImput')).focus();
      });
    };

    // vm.vendors = VendorsService.query();
  }
}());
