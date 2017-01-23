(function () {
  'use strict';

  // Vendors controller
  angular
    .module('vendors')
    .controller('VendorsController', VendorsController);

  VendorsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'vendorResolve'];

  function VendorsController ($scope, $state, $window, Authentication, vendor) {
    var vm = this;

    vm.authentication = Authentication;
    vm.vendor = vendor;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Vendor
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.vendor.$remove($state.go('vendors.list'));
      }
    }

    // Save Vendor
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.vendorForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.vendor._id) {
        vm.vendor.$update(successCallback, errorCallback);
      } else {
        vm.vendor.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('vendors.view', {
          vendorId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());
