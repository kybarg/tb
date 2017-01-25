(function () {
  'use strict';

  angular
    .module('core')
    .controller('HeaderController', HeaderController);

  HeaderController.$inject = ['$window', '$mdSidenav', '$scope', '$state', 'Authentication', 'menuService', 'isDrawerOpen'];

  function HeaderController($window, $mdSidenav, $scope, $state, Authentication, menuService, isDrawerOpen) {
    var vm = this;
    vm.back = false;
    vm.showBackButton = false;

    vm.accountMenu = menuService.getMenu('account').items[0];
    vm.authentication = Authentication;
    vm.isCollapsed = false;
    vm.menu = menuService.getMenu('topbar');

    $scope.$on('$stateChangeSuccess', stateChangeSuccess);

    function stateChangeSuccess(ev, to, toParams, from, fromParams) {
      // Collapsing the menu after navigation
      vm.isCollapsed = false;

      vm.hasTabs = $state.current.views && $state.current.views.hasOwnProperty('tabs@');
      vm.sectionName = $state.current.data.pageTitle;

      vm.showBackButton = $state.current.data.back;

      vm.back = function() {
        $window.history.back();
      };
    }

    vm.isDrawerOpen = isDrawerOpen;

    vm.toggleDrawer = function() {
      $mdSidenav('drawer').toggle();
    };

  }
}());
