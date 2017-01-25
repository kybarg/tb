(function () {
  'use strict';

  angular
    .module('core.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider', '$urlRouterProvider'];

  function routeConfig($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.rule(function ($injector, $location) {
      var path = $location.path();
      var hasTrailingSlash = path.length > 1 && path[path.length - 1] === '/';

      if (hasTrailingSlash) {
        // if last character is a slash, return the same url without the slash
        var newPath = path.substr(0, path.length - 1);
        $location.replace().path(newPath);
      }
    });

    // Redirect to 404 when route not found
    $urlRouterProvider.otherwise(function ($injector, $location) {
      $injector.get('$state').transitionTo('not-found', null, {
        location: false
      });
    });

    $stateProvider
      .state('admin', {
        abstract: true,
        url: '/admin',
        views: {
          '@': {
            templateUrl: '/modules/core/client/admin/views/layout.client.view.html'
          },
          'toolbar@admin': {
            templateUrl: '/modules/core/client/admin/views/header.client.view.html',
            controller: 'HeaderController',
            controllerAs: 'vm'
          },
          'drawer@admin': {
            templateUrl: '/modules/core/client/admin/views/drawer.client.view.html',
            controller: 'DrawerController',
            controllerAs: 'vm'
          }
        }
      })
      .state('admin.home', {
        url: '',
        templateUrl: '/modules/core/client/admin/views/home.client.view.html',
        controller: 'HomeController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Home',
          roles: ['admin']
        }
      })
      .state('not-found', {
        url: '/not-found',
        templateUrl: '/modules/core/client/admin/views/404.client.view.html',
        controller: 'ErrorController',
        controllerAs: 'vm',
        params: {
          message: function ($stateParams) {
            return $stateParams.message;
          }
        },
        data: {
          ignoreState: true,
          pageTitle: 'Not Found'
        }
      })
      .state('bad-request', {
        url: '/bad-request',
        templateUrl: '/modules/core/client/admin/views/400.client.view.html',
        controller: 'ErrorController',
        controllerAs: 'vm',
        params: {
          message: function ($stateParams) {
            return $stateParams.message;
          }
        },
        data: {
          ignoreState: true,
          pageTitle: 'Bad Request'
        }
      })
      .state('forbidden', {
        url: '/forbidden',
        templateUrl: '/modules/core/client/admin/views/403.client.view.html',
        data: {
          ignoreState: true,
          pageTitle: 'Forbidden'
        }
      });
  }
} ());
