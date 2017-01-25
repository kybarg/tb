(function () {
  'use strict';

  // Setting up route
  angular
    .module('users.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    // $stateProvider
    //   .state('admin.authentication', {
    //     abstract: true,
    //     url: '/authentication',
    //     templateUrl: '/modules/users/client/admin/views/authentication/authentication.client.view.html',
    //     controller: 'AuthenticationController',
    //     controllerAs: 'vm'
    //   })
    //   .state('admin.authentication.signin', {
    //     url: '/signin?err',
    //     templateUrl: '/modules/users/client/admin/views/authentication/signin.client.view.html',
    //     controller: 'AuthenticationController',
    //     controllerAs: 'vm',
    //     data: {
    //       pageTitle: 'Signin'
    //     }
    //   })

    //   .state('admin.user', {
    //     url: '/users/:userId',
    //     templateUrl: '/modules/users/client/admin/views/view-user.client.view.html',
    //     controller: 'UserController',
    //     controllerAs: 'vm',
    //     resolve: {
    //       userResolve: getUser
    //     },
    //     data: {
    //       pageTitle: 'Edit {{ userResolve.displayName }}'
    //     }
    //   })
    //   .state('admin.user-edit', {
    //     url: '/users/:userId/edit',
    //     templateUrl: '/modules/users/client/admin/views/edit-user.client.view.html',
    //     controller: 'UserController',
    //     controllerAs: 'vm',
    //     resolve: {
    //       userResolve: getUser
    //     },
    //     data: {
    //       pageTitle: 'Edit User {{ userResolve.displayName }}'
    //     }
    //   })
    $stateProvider
      .state('admin.users', {
        abstract: true,
        url: '/users',
        template: '<ui-view/>'
      })
      .state('admin.users.list', {
        url: '',
        templateUrl: '/modules/users/client/admin/views/list-users.client.view.html',
        controller: 'UserListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Users',
          roles: ['admin']
        }
      })
      .state('admin.user', {
        url: '/users/:userId/edit',
        templateUrl: '/modules/users/client/admin/views/edit-user.client.view.html',
        controller: 'UserController',
        controllerAs: 'vm',
        resolve: {
          userResolve: getUser
        },
        data: {
          pageTitle: 'Edit User',
          roles: ['admin']
        }
      })
      .state('admin.settings', {
        abstract: true,
        url: '/settings',
        templateUrl: '/modules/users/client/admin/views/settings/settings.client.view.html',
        controller: 'SettingsController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        }
      })
      .state('admin.settings.profile', {
        url: '/profile',
        templateUrl: '/modules/users/client/admin/views/settings/edit-profile.client.view.html',
        controller: 'EditProfileController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Settings'
        }
      })
      .state('admin.settings.password', {
        url: '/password',
        templateUrl: '/modules/users/client/admin/views/settings/change-password.client.view.html',
        controller: 'ChangePasswordController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Settings password'
        }
      })
      .state('admin.settings.accounts', {
        url: '/accounts',
        templateUrl: '/modules/users/client/admin/views/settings/manage-social-accounts.client.view.html',
        controller: 'SocialAccountsController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Settings accounts'
        }
      })
      .state('admin.settings.picture', {
        url: '/picture',
        templateUrl: '/modules/users/client/admin/views/settings/change-profile-picture.client.view.html',
        controller: 'ChangeProfilePictureController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Settings picture'
        }
      })
      .state('admin.authentication', {
        abstract: true,
        url: '/authentication',
        views: {
          '@': {
            templateUrl: '/modules/core/client/admin/views/layout-no-drawer-no-topbar.client.view.html'
          },
        },

        templateUrl: '/modules/users/client/admin/views/authentication/authentication.client.view.html',
        controller: 'AuthenticationController',
        controllerAs: 'vm'
      })
      .state('admin.authentication.signup', {
        url: '/signup',
        templateUrl: '/modules/users/client/admin/views/authentication/signup.client.view.html',
        controller: 'AuthenticationController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Signup'
        }
      })
      .state('admin.authentication.signin', {
        url: '/signin?err',
        templateUrl: '/modules/users/client/admin/views/authentication/signin.client.view.html',
        controller: 'AuthenticationController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Signin'
        }
      })
      .state('admin.password', {
        abstract: true,
        url: '/password',
        template: '<ui-view/>'
      })
      .state('admin.password.forgot', {
        url: '/forgot',
        templateUrl: '/modules/users/client/admin/views/password/forgot-password.client.view.html',
        controller: 'PasswordController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Password forgot'
        }
      })
      .state('admin.password.reset', {
        abstract: true,
        url: '/reset',
        template: '<ui-view/>'
      })
      .state('admin.password.reset.invalid', {
        url: '/invalid',
        templateUrl: '/modules/users/client/admin/views/password/reset-password-invalid.client.view.html',
        data: {
          pageTitle: 'Password reset invalid'
        }
      })
      .state('admin.password.reset.success', {
        url: '/success',
        templateUrl: '/modules/users/client/admin/views/password/reset-password-success.client.view.html',
        data: {
          pageTitle: 'Password reset success'
        }
      })
      .state('admin.password.reset.form', {
        url: '/:token',
        templateUrl: '/modules/users/client/admin/views/password/reset-password.client.view.html',
        controller: 'PasswordController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Password reset form'
        }
      });

    getUser.$inject = ['$stateParams', 'AdminService'];

    function getUser($stateParams, AdminService) {
      return AdminService.get({
        userId: $stateParams.userId
      }).$promise;
    }
  }
}());
