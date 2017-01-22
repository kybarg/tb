(function () {
  'use strict';

  describe('Vendors Controller Tests', function () {
    // Initialize global variables
    var VendorsController,
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

      // create mock Vendor
      mockVendor = new VendorsService({
        _id: '525a8422f6d0f87f0e407a33',
        name: 'Vendor Name'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Vendors controller.
      VendorsController = $controller('VendorsController as vm', {
        $scope: $scope,
        vendorResolve: {}
      });

      // Spy on state go
      spyOn($state, 'go');
    }));

    describe('vm.save() as create', function () {
      var sampleVendorPostData;

      beforeEach(function () {
        // Create a sample Vendor object
        sampleVendorPostData = new VendorsService({
          name: 'Vendor Name'
        });

        $scope.vm.vendor = sampleVendorPostData;
      });

      it('should send a POST request with the form input values and then locate to new object URL', inject(function (VendorsService) {
        // Set POST response
        $httpBackend.expectPOST('api/vendors', sampleVendorPostData).respond(mockVendor);

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();

        // Test URL redirection after the Vendor was created
        expect($state.go).toHaveBeenCalledWith('vendors.view', {
          vendorId: mockVendor._id
        });
      }));

      it('should set $scope.vm.error if error', function () {
        var errorMessage = 'this is an error message';
        $httpBackend.expectPOST('api/vendors', sampleVendorPostData).respond(400, {
          message: errorMessage
        });

        $scope.vm.save(true);
        $httpBackend.flush();

        expect($scope.vm.error).toBe(errorMessage);
      });
    });

    describe('vm.save() as update', function () {
      beforeEach(function () {
        // Mock Vendor in $scope
        $scope.vm.vendor = mockVendor;
      });

      it('should update a valid Vendor', inject(function (VendorsService) {
        // Set PUT response
        $httpBackend.expectPUT(/api\/vendors\/([0-9a-fA-F]{24})$/).respond();

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();

        // Test URL location to new object
        expect($state.go).toHaveBeenCalledWith('vendors.view', {
          vendorId: mockVendor._id
        });
      }));

      it('should set $scope.vm.error if error', inject(function (VendorsService) {
        var errorMessage = 'error';
        $httpBackend.expectPUT(/api\/vendors\/([0-9a-fA-F]{24})$/).respond(400, {
          message: errorMessage
        });

        $scope.vm.save(true);
        $httpBackend.flush();

        expect($scope.vm.error).toBe(errorMessage);
      }));
    });

    describe('vm.remove()', function () {
      beforeEach(function () {
        // Setup Vendors
        $scope.vm.vendor = mockVendor;
      });

      it('should delete the Vendor and redirect to Vendors', function () {
        // Return true on confirm message
        spyOn(window, 'confirm').and.returnValue(true);

        $httpBackend.expectDELETE(/api\/vendors\/([0-9a-fA-F]{24})$/).respond(204);

        $scope.vm.remove();
        $httpBackend.flush();

        expect($state.go).toHaveBeenCalledWith('vendors.list');
      });

      it('should should not delete the Vendor and not redirect', function () {
        // Return false on confirm message
        spyOn(window, 'confirm').and.returnValue(false);

        $scope.vm.remove();

        expect($state.go).not.toHaveBeenCalled();
      });
    });
  });
}());
