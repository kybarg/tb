(function () {
  'use strict';

  angular
    .module('categories')
    .controller('CategoriesController', CategoriesController);

  CategoriesController.$inject = ['$element', '$mdDialog', '$mdToast', '$state', '$scope', 'categoryResolve', 'CategoriesService', 'Upload'];

  function CategoriesController($element, $mdDialog, $mdToast, $state, $scope, category, CategoriesService, Upload) {
    var vm = this;

    vm.category = category;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    vm.pictures = vm.category.picture;

    vm.uploadPicture = uploadPicture;
    vm.deletePicture = deletePicture;
    vm.uploadProgress = 0;

    vm.getCategories = getCategories;

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

    function getCategories() {

      var query = {};
      if (vm.searchTerm) {
        query.name = vm.searchTerm;
      } else {
        query.parent = '';
      }
      return CategoriesService.query(query, function (result) {
        vm.categories = baseCategories.concat(result.items.filter(function (item) {
          if (parent)
            return item._id !== parent._id;
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
    };

    $element.find('input').on('keydown', function (ev) {
      ev.stopPropagation();
    });

    // upload on file select or drop
    function uploadPicture(file) {
      if (file)
        Upload
          .upload({
            url: '/api/categories/' + vm.category._id + '/pictures',
            method: 'POST',
            data: {
              picture: file
              // category: $scope.$parent.model,
              // body: {
              //   picture: file
              // }
            }
          })
          .then(function (response) {
            category = Object.assign(category, response.data);
            vm.category = category;
            vm.pictures.push(category.picture.pop());
            vm.category.picture = vm.pictures;
            vm.uploadProgress = 0;
            // vm.pictures.push(response.data);
            // console.log('Success ' + response.config.data.category.picture.pop().name + 'uploaded. Response: ' + response.data);
          }, function (response) {
            errorCallback(response)
            // console.log('Error status: ' + response.status);
          }, function (event) {
            var progressPercentage = parseInt(100.0 * event.loaded / event.total);
            vm.uploadProgress = progressPercentage;
            // console.log('progress: ' + progressPercentage + '% ' + event.config.data.category.picture.pop().name);
          });
    };


    function deletePicture(id) {
      CategoriesService.deletePicture({ categoryId: vm.category._id, pictureId: id })
        .then(function (response) {
          vm.category = Object.assign(vm.category, response.data);
          vm.pictures = vm.pictures.filter(function (value) {
            return value._id !== response.pictureId;
          });
        })
        .catch(errorCallback);
    }

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
          $state.go('admin.categories.list');
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

      console.dir(vm.category);

      // Create a new category, or update the current instance
      vm.category.createOrUpdate()
        .then(successCallback)
        .catch(errorCallback);

      function successCallback(res) {
        $state.go('admin.categories.list'); // should we send the User to the list or the updated Category's view?
        $mdToast.show($mdToast.simple({ position: 'bottom right' }).textContent('Category saved successfully!'));
      }

    }
    function errorCallback(res) {
      var message = res.data && typeof res.data === 'string' ? res.data : (typeof res.data.message === 'string' ? res.data.message : false);
      $mdToast.show($mdToast.simple({ position: 'bottom right' }).textContent( message ? message : 'Category save error!'));
    }

  }
} ());
