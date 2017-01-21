(function () {
  'use strict';

  angular
    .module('pictures')
    .controller('PicturesController', PicturesController);

  PicturesController.$inject = ['$scope', '$resource', 'Upload', '$http'];

  function PicturesController($scope, $resource, Upload, $http) {

    var vm = this;
    vm.pictures = $scope.$parent.model.picture;

    // upload later on form submit or something similar
    vm.submit = function() {
      if (vm.form.file.$valid && vm.file) {
        vm.upload(vm.file);
      }
    };

    // upload on file select or drop
    vm.upload = function (file) {
      if(file)
        Upload
          .upload({
              url: '/api/categories/' + $scope.$parent.model._id + '/pictures',
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
              vm.pictures.push(response.data);
              console.log('Success ' + response.config.data.picture.name + 'uploaded. Response: ' + response.data);
          }, function (response) {
              console.log('Error status: ' + response.status);
          }, function (event) {
              var progressPercentage = parseInt(100.0 * event.loaded / event.total);
              console.log('progress: ' + progressPercentage + '% ' + event.config.data.picture.name);
          });
    };


    vm.delete = function(id) {
      $http.delete('/api/categories/' + $scope.$parent.model._id + '/pictures/' +id)
        .then(function(response){

          if (response.status == 200) {
            vm.pictures = vm.pictures.filter(function(value){
              return value._id !== response.data.pictureId;
            });
            // $scope.files.splice(idx, 1);
          }
         });
    }

    // for multiple files:
    // vm.uploadFiles = function (files) {
    //   if (files && files.length) {
    //     for (var i = 0; i < files.length; i++) {
    //       Upload.upload({..., data: {file: files[i]}, ...})...;
    //     }
    //     // or send them all together for HTML5 browsers:
    //     Upload.upload({..., data: {file: files}, ...})...;
    //   }
    // }
  }

}());
