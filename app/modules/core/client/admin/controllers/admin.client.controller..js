(function () {
  'use strict';

  angular
    .module('core')
    .controller('AdminController', AdminController);

  angular.module('core').value('isDrawerOpen', true);

  function AdminController($mdSidenav, $scope) {
    var vm = this;

  }
}());
