(function () {
  'use strict';

  angular
    .module('articles')
    .controller('ArticlesController', ArticlesController);

  ArticlesController.$inject = ['$mdDialog', '$mdToast', '$scope', '$state', '$window', 'articleResolve', 'Authentication', 'Notification'];

  function ArticlesController($mdDialog, $mdToast, $scope, $state, $window, article, Authentication, Notification) {
    var vm = this;

    vm.article = article;
    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    // Remove existing Article
    function remove() {
      var confirm = $mdDialog.confirm()
        .title('Are you sure you want to remove?')
        .textContent('Article will be removed permanently.')
        .ariaLabel('Remove confirmation')
        .ok('Remove')
        .cancel('Cancel');

      $mdDialog.show(confirm).then(function() {
        vm.article.$remove(function() {
          $state.go('admin.articles.list')
          $mdToast.show($mdToast.simple({position: 'bottom right'}).textContent('Article removed successfully!'));
        });
      });
    }

    // Save Article
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.articleForm');
        return false;
      }

      // Create a new article, or update the current instance
      vm.article.createOrUpdate()
        .then(successCallback)
        .catch(errorCallback);

      function successCallback(res) {
        $state.go('admin.articles.list'); // should we send the User to the list or the updated Article's view?
        $mdToast.show($mdToast.simple({position: 'bottom right'}).textContent('Article saved successfully!'));
      }

      function errorCallback(res) {
        $mdToast.show($mdToast.simple({position: 'bottom right'}).textContent('Article save error!'));
      }
    }
  }
}());
