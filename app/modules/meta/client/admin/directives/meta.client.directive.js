(function () {
  'use strict';

  // Users directive used to force lowercase input
  angular
    .module('meta')
    .directive('mdMeta', mdMeta);

  function mdMeta() {
    return {
      scope: {
        model: '=model'
      },
      templateUrl: '/modules/meta/client/admin/views/form-meta.client.view.html'
    };
  }
}());
