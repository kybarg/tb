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
      // .state('', {
      //   abstract: true,
      //   url: '/',
      //   views: {
      //     '@': {
      //       templateUrl: '/modules/core/client/all/views/layout.client.view.html'
      //     },
      //     'toolbar@all': {
      //       templateUrl: '/modules/core/client/all/views/header.client.view.html',
      //       controller: 'HeaderController',
      //       controllerAs: 'vm'
      //     },
      //     'drawer@all': {
      //       templateUrl: '/modules/core/client/all/views/drawer.client.view.html',
      //       controller: 'DrawerController',
      //       controllerAs: 'vm'
      //     }
      //   }
      // })
      .state('home', {
        url: '/',
         views: {
          '@': {
            templateUrl: '/modules/core/client/all/views/layout.client.view.html'
          },
          'toolbar@home': {
            templateUrl: '/modules/core/client/all/views/header.client.view.html',
            controller: 'HeaderController',
            controllerAs: 'vm'
          },
          'drawer@home': {
            templateUrl: '/modules/core/client/all/views/drawer.client.view.html',
            controller: 'DrawerController',
            controllerAs: 'vm'
          },
          '@home': {
            templateUrl: '/modules/core/client/all/views/home.client.view.html',
            controller: 'HomeController',
            controllerAs: 'vm'
          }
        }
      })
      .state('not-found', {
        url: '/not-found',
        templateUrl: '/modules/core/client/all/views/404.client.view.html',
        controller: 'ErrorController',
        controllerAs: 'vm',
        params: {
          message: function($stateParams) {
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
        templateUrl: '/modules/core/client/views/400.client.view.html',
        controller: 'ErrorController',
        controllerAs: 'vm',
        params: {
          message: function($stateParams) {
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
        templateUrl: '/modules/core/client/views/403.client.view.html',
        data: {
          ignoreState: true,
          pageTitle: 'Forbidden'
        }
      });
  }
}());
