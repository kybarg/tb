(function () {
  'use strict';

  angular
    .module('articles')
    .controller('ArticlesListController', ArticlesListController);

  ArticlesListController.$inject = ['$mdDialog', '$filter', '$location', 'ArticlesService'];

  function ArticlesListController($mdDialog, $filter, $location, ArticlesService) {
    var bookmark;
    var vm = this;

    vm.selected = [];

    vm.filter = {
      options: {
        debounce: 500
      }
    };

    var defaultQuery = {
      filter: '',
      limit: 5,
      order: '-created',
      page: 1
    };

    vm.query = Object.assign(Object.create(defaultQuery), $location.search());

    function success(articles) {
      vm.articles = articles;
    }

    // vm.addItem = function (event) {
    //   $mdDialog.show({
    //     clickOutsideToClose: true,
    //     controller: 'addItemController',
    //     controllerAs: 'ctrl',
    //     focusOnOpen: false,
    //     targetEvent: event,
    //     templateUrl: 'templates/add-item-dialog.html'
    //   }).then(vm.getArticles);
    // };

    vm.delete = function (event) {
      $mdDialog.show({
        clickOutsideToClose: true,
        controller: 'deleteController',
        controllerAs: 'ctrl',
        focusOnOpen: false,
        targetEvent: event,
        locals: {
          articles: vm.selected
        },
        templateUrl: 'templates/delete-dialog.html'
      }).then(vm.getArticles);
    };

    vm.getArticles = function () {
      var params = {};

      for(var prop in vm.query) {
        if (defaultQuery.hasOwnProperty(prop)) {
          if (defaultQuery[prop] != vm.query[prop]) params[prop] = vm.query[prop];
        } else {
          params[prop] = vm.query[prop];
        }
      }

      $location.path($location.path()).search(params);
      vm.promise = ArticlesService.query(vm.query, success).$promise;
    };

    vm.removeFilter = function () {
      vm.filter.show = false;
      vm.query.filter = '';

      if (vm.filter.form.$dirty) {
        vm.filter.form.$setPristine();
      }
    };

    // vm.$watch('query.filter', function (newValue, oldValue) {
    //   if (!oldValue) {
    //     bookmark = vm.query.page;
    //   }

    //   if (newValue !== oldValue) {
    //     vm.query.page = 1;
    //   }

    //   if (!newValue) {
    //     vm.query.page = bookmark;
    //   }

    // });
      vm.getArticles();
  }
}());
