(function () {
  'use strict';

  angular
    .module('users')
    .controller('AuthenticationController', AuthenticationController);

  AuthenticationController.$inject = ['$scope', '$state', 'UsersService', '$location', '$window', 'Authentication', 'PasswordValidator', '$mdToast'];

  function AuthenticationController($scope, $state, UsersService, $location, $window, Authentication, PasswordValidator, $mdToast) {
    var vm = this;

    vm.authentication = Authentication;
    vm.getPopoverMsg = PasswordValidator.getPopoverMsg;
    vm.signup = signup;
    vm.signin = signin;
    vm.callOauthProvider = callOauthProvider;
    vm.usernameRegex = /^(?=[\w.-]+$)(?!.*[._-]{2})(?!\.)(?!.*\.$).{3,34}$/;

    // Get an eventual error defined in the URL query string:
    if ($location.search().err) {
      $mdToast.show($mdToast.simple({ position: 'bottom right' }).textContent($location.search().err));
    }

    // If user is signed in then redirect back home
    if (vm.authentication.user) {
      $location.path('/admin');
    }

    function signup(isValid) {

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');

        return false;
      }

      UsersService.userSignup(vm.credentials)
        .then(onUserSignupSuccess)
        .catch(onUserSignupError);
    }

    function signin(isValid) {

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');

        return false;
      }

      UsersService.userSignin(vm.credentials)
        .then(onUserSigninSuccess)
        .catch(onUserSigninError);
    }

    // OAuth provider request
    function callOauthProvider(url) {
      if ($state.previous && $state.previous.href) {
        url += '?redirect_to=' + encodeURIComponent($state.previous.href);
      }

      // Effectively call OAuth authentication route:
      $window.location.href = url;
    }

    // Authentication Callbacks

    function onUserSignupSuccess(response) {
      // If successful we assign the response to the global user model
      vm.authentication.user = response;
      $mdToast.show($mdToast.simple({ position: 'bottom right' }).textContent('Signup successful!'));
      // And redirect to the previous or home page
      $state.go($state.previous.state.name || 'home', $state.previous.params);
    }

    function onUserSignupError(response) {
      $mdToast.show($mdToast.simple({ position: 'bottom right', hideDelay: 6000 }).textContent(response.data.message));
    }

    function onUserSigninSuccess(response) {
      // If successful we assign the response to the global user model
      vm.authentication.user = response;
      $mdToast.show($mdToast.simple({ position: 'bottom right'}).textContent('Welcome ' + response.firstName));
      // And redirect to the previous or home page
      $state.go($state.previous.state.name || 'admin', $state.previous.params);
    }

    function onUserSigninError(response) {
      $mdToast.show($mdToast.simple({ position: 'bottom right', hideDelay: 6000 }).textContent(response.data ? response.data.message : 'Signin Error!'));
    }
  }
}());
