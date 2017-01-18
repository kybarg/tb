(function () {
  'use strict';

  angular
    .module('core')
    .controller('HeaderController', HeaderController);

  HeaderController.$inject = ['$mdSidenav', '$scope', '$state', 'Authentication', 'menuService', 'isDrawerOpen'];

  function HeaderController($mdSidenav, $scope, $state, Authentication, menuService, isDrawerOpen) {
    var vm = this;

    vm.accountMenu = menuService.getMenu('account').items[0];
    vm.authentication = Authentication;
    vm.isCollapsed = false;
    vm.menu = menuService.getMenu('topbar');

    $scope.$on('$stateChangeSuccess', stateChangeSuccess);

    function stateChangeSuccess() {
      // Collapsing the menu after navigation
      vm.isCollapsed = false;
    }

    $scope.isDrawerOpen = isDrawerOpen;
    
    $scope.toggleDrawer = function() {
      $mdSidenav('drawer').toggle();
    };

  }
}());
