// (function () {
//   'use strict';

//   angular.module('core')
//     .directive('sectionTitle', sectionTitle);

//   sectionTitle.$inject = ['$rootScope', '$interpolate', '$state'];

//   function sectionTitle($rootScope, $interpolate, $state) {
//     var directive = {
//       restrict: 'A',
//       link: link
//     };

//     return directive;

//     function link(scope, element) {
//       // $rootScope.$on('$viewContentLoaded', listener);
//       $rootScope.$on('$stateChangeSuccess', listener);

//       function listener(event, toState) {
//         console.dir(toState)
//         var applicationCoreTitle = 'Trendberry';
//         if (toState.data && toState.data.pageTitle) {
//           var sectionTitle = $interpolate(toState.data.pageTitle)($state.$current.locals.globals);
//           element.html(sectionTitle);
//         } else {
//           element.html(applicationCoreTitle);
//         }
//       }
//     }
//   }
// }());
