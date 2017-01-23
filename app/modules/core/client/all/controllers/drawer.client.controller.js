(function () {
  'use strict';

  angular
    .module('core')
    .controller('DrawerController', DrawerController);

  DrawerController.$inject = ['$scope', '$state', 'Authentication', 'menuService', 'isDrawerOpen'];

  function DrawerController($scope, $state, Authentication, menuService, isDrawerOpen) {
    var vm = this;

    vm.accountMenu = menuService.getMenu('account').items[0];
    vm.authentication = Authentication;
    vm.isCollapsed = false;
    vm.menu = menuService.getMenu('drawer');

    $scope.$on('$stateChangeSuccess', stateChangeSuccess);

    $scope.isDrawerOpen = isDrawerOpen;

    function stateChangeSuccess() {
      // Collapsing the menu after navigation
      vm.isCollapsed = false;
    }
  }
}());
