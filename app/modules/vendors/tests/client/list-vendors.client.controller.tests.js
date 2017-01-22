(function () {
  'use strict';

  describe('Vendors List Controller Tests', function () {
    // Initialize global variables
    var VendorsListController,
      $scope,
      $httpBackend,
      $state,
      Authentication,
      VendorsService,
      mockVendor;

    // The $resource service augments the response object with methods for updating and deleting the resource.
    // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
    // the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
    // When the toEqualData matcher compares two objects, it takes only object properties into
    // account and ignores methods.
    beforeEach(function () {
      jasmine.addMatchers({
        toEqualData: function (util, customEqualityTesters) {
          return {
            compare: function (actual, expected) {
              return {
                pass: angular.equals(actual, expected)
              };
            }
          };
        }
      });
    });

    // Then we can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($controller, $rootScope, _$state_, _$httpBackend_, _Authentication_, _VendorsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();

      // Point global variables to injected services
      $httpBackend = _$httpBackend_;
      $state = _$state_;
      Authentication = _Authentication_;
      VendorsService = _VendorsService_;

      // create mock article
      mockVendor = new VendorsService({
        _id: '525a8422f6d0f87f0e407a33',
        name: 'Vendor Name'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Vendors List controller.
      VendorsListController = $controller('VendorsListController as vm', {
        $scope: $scope
      });

      // Spy on state go
      spyOn($state, 'go');
    }));

    describe('Instantiate', function () {
      var mockVendorList;

      beforeEach(function () {
        mockVendorList = [mockVendor, mockVendor];
      });

      it('should send a GET request and return all Vendors', inject(function (VendorsService) {
        // Set POST response
        $httpBackend.expectGET('api/vendors').respond(mockVendorList);


        $httpBackend.flush();

        // Test form inputs are reset
        expect($scope.vm.vendors.length).toEqual(2);
        expect($scope.vm.vendors[0]).toEqual(mockVendor);
        expect($scope.vm.vendors[1]).toEqual(mockVendor);

      }));
    });
  });
}());
