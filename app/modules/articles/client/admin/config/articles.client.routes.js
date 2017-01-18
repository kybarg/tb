(function () {
  'use strict';

  angular
    .module('articles.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.articles', {
        abstract: true,
        url: '/articles',
        template: '<ui-view/>'
      })
      .state('admin.articles.list', {
        url: '',
        templateUrl: '/modules/articles/client/admin/views/list-articles.client.view.html',
        controller: 'ArticlesListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Articles',
          roles: ['admin']
        }
      })
      .state('admin.articles.create', {
        url: '/create',
        templateUrl: '/modules/articles/client/admin/views/form-article.client.view.html',
        controller: 'ArticlesController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Create Article',
          roles: ['admin']
        },
        resolve: {
          articleResolve: newArticle
        }
      })
      .state('admin.articles.edit', {
        url: '/:articleId/edit',
        templateUrl: '/modules/articles/client/admin/views/form-article.client.view.html',
        controller: 'ArticlesController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Edit Article',
          roles: ['admin']
        },
        resolve: {
          articleResolve: getArticle
        }
      });
  }

  getArticle.$inject = ['$stateParams', 'ArticlesService'];

  function getArticle($stateParams, ArticlesService) {
    return ArticlesService.get({
      articleId: $stateParams.articleId
    }).$promise;
  }

  newArticle.$inject = ['ArticlesService'];

  function newArticle(ArticlesService) {
    return new ArticlesService();
  }
}());
