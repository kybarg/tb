(function () {
  'use strict';

  angular
    .module('core')
    .controller('HeaderController', HeaderController);

  HeaderController.$inject = ['$mdSidenav', '$scope', '$state', 'Authentication', 'menuService', '$interpolate'];

  function HeaderController($mdSidenav, $scope, $state, Authentication, menuService, $interpolate) {
    var vm = this;
    vm.back = false;
    vm.showBackButton = false;

    vm.accountMenu = menuService.getMenu('account').items[0];
    vm.authentication = Authentication;
    vm.isCollapsed = false;
    vm.menu = menuService.getMenu('topbar');

    $scope.$on('$stateChangeSuccess', stateChangeSuccess);

    function stateChangeSuccess() {
      // Collapsing the menu after navigation
      vm.isCollapsed = false;

      vm.hasTabs = $state.current.views && $state.current.views.hasOwnProperty('tabs@');

      if ($state.current.data && $state.current.data.pageTitle) {
        var sectionTitle = $interpolate($state.current.data.pageTitle)($state.$current.locals.globals);
        vm.sectionName = sectionTitle;
      } else {
        vm.sectionName = 'Trendberry';
      }

      vm.showBackButton = $state.current.data.back;

      vm.back = function() {
        $window.history.back();
      };
    }

    $scope.toggleDrawer = function() {
      $mdSidenav('drawer').toggle();
    };

  }
}());
