(function () {
  'use strict';

  angular
    .module('categories')
    .controller('CategoriesController', CategoriesController);

  CategoriesController.$inject = ['$element', '$mdDialog', '$mdToast', '$state', '$scope', '$window', 'categoryResolve', 'CategoriesService', 'Authentication', 'Notification'];

  function CategoriesController($element, $mdDialog, $mdToast, $state, $scope, $window, category, CategoriesService, Authentication, Notification) {
    var vm = this;

    vm.category = category;
    vm.error = null;
    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    vm.searchTerm;
    vm.clearSearchTerm = function () {
      vm.searchTerm = '';
    };

    var parent = category.parent;
    var baseCategories = [{
      _id: null,
      name: 'None'
    }];
    if (parent) baseCategories.push(parent);
    else category.parent = baseCategories[0];

    vm.parent = parent ? parent._id : undefined;
    vm.categories = baseCategories;

    vm.getCategories = function () {

      console.dir(vm.category.meta);

      var query = {};
      if (vm.searchTerm) {
        query.name = vm.searchTerm;
      } else {
        query.parent = '';
      }
      return CategoriesService.query(query, function (result) {
        vm.categories = baseCategories.concat(result.items.filter(function (item) {
          if(parent)
            return item._id != parent._id;
          return true;
        })).sort(function (a, b) {
          var nameA = a.name.toUpperCase(); // ignore upper and lowercase
          var nameB = b.name.toUpperCase(); // ignore upper and lowercase

          if (vm.searchTerm) {
            var searchTerm = vm.searchTerm.toUpperCase();
            var indexA = nameA.indexOf(searchTerm);
            var indexB = nameB.indexOf(searchTerm);
            if (nameA < nameB) {
              return (indexA - indexB) * 2 - 1;
            }
            if (nameA > nameB) {
              return (indexA - indexB) * 2 + 1;
            }
          }

          if (nameA < nameB) {
            return - 1;
          }
          if (nameA > nameB) {
            return 1;
          }

          // names must be equal
          return 0;
        });
      }).$promise;
    }

    $element.find('input').on('keydown', function (ev) {
      ev.stopPropagation();
    });

    // Remove existing Category
    function remove() {
      var confirm = $mdDialog.confirm()
        .title('Are you sure you want to remove?')
        .textContent('Category will be removed permanently.')
        .ariaLabel('Remove confirmation')
        .ok('Remove')
        .cancel('Cancel');

      $mdDialog.show(confirm).then(function () {
        vm.category.$remove(function () {
          $state.go('admin.categories.list')
          $mdToast.show($mdToast.simple({ position: 'bottom right' }).textContent('Category removed successfully!'));
        });
      });
    }

    // Save Category
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.categoryForm');
        return false;
      }

      // Create a new category, or update the current instance
      vm.category.createOrUpdate()
        .then(successCallback)
        .catch(errorCallback);

      function successCallback(res) {
        $state.go('admin.categories.list'); // should we send the User to the list or the updated Category's view?
        $mdToast.show($mdToast.simple({ position: 'bottom right' }).textContent('Category saved successfully!'));
      }

      function errorCallback(res) {
        $mdToast.show($mdToast.simple({ position: 'bottom right' }).textContent('Category save error!'));
      }
    }
  }
} ());
