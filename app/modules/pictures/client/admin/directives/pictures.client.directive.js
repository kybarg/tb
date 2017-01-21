(function () {
  'use strict';


  angular
    .module('pictures')
    .config(function($mdThemingProvider) {
      // Register your custom stylesheet into the theming provider.
      $mdThemingProvider.registerStyles("tb-pictures.md-THEME_NAME-theme label{color:'{{foreground-2}}'}tb-pictures.md-THEME_NAME-theme .tb-pictures__drop-box{border-color:'{{foreground-4}}'}tb-pictures.md-THEME_NAME-theme .tb-pictures__drop-box.dragover{border-color:'{{primary-color}}';background-color:'{{primary-color-0.2}}'}");
    })
    .directive('tbPictures', tbPictures);

  // tbPictures.$inject = ['$mdAria'];

  function tbPictures() {
    return {
      // scope: {
      //   action: '=action',
      //   'model': '=model'
      // },
      templateUrl: '/modules/pictures/client/admin/views/form-pictures.client.view.html'
      // link: postLink
    };
  }

  // function postLink(scope, element, attr) {
  //   $mdTheming(element);
  // }

}());
