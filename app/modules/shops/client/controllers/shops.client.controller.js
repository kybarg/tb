(function () {
  'use strict';

  // Shops controller
  angular
    .module('shops')
    .controller('ShopsController', ShopsController);

  ShopsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'shopResolve'];

  function ShopsController ($scope, $state, $window, Authentication, shop) {
    var vm = this;

    vm.authentication = Authentication;
    vm.shop = shop;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Shop
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.shop.$remove($state.go('shops.list'));
      }
    }

    // Save Shop
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.shopForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.shop._id) {
        vm.shop.$update(successCallback, errorCallback);
      } else {
        vm.shop.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('shops.view', {
          shopId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
