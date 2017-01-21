(function () {
  'use strict';

  // Users directive used to force lowercase input
  angular
    .module('meta')
    .directive('tbMeta', tbMeta);

  function tbMeta() {
    return {
      scope: {
        model: '=model'
      },
      templateUrl: '/modules/meta/client/admin/views/form-meta.client.view.html'
    };
  }
}());
