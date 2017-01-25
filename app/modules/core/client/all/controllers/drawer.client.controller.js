(function () {
  'use strict';

  angular
    .module('core')
    .controller('DrawerController', DrawerController);

  DrawerController.$inject = ['$mdSidenav', '$scope', '$state', 'Authentication', 'menuService'];

  function DrawerController($mdSidenav, $scope, $state, Authentication, menuService) {
    var vm = this;

    vm.accountMenu = menuService.getMenu('account').items[0];
    vm.authentication = Authentication;
    vm.isCollapsed = false;
    vm.menu = menuService.getMenu('drawer');

    $scope.$on('$stateChangeSuccess', stateChangeSuccess);

    function stateChangeSuccess() {
      $mdSidenav('drawer').close();
    }
  }
}());
