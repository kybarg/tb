(function () {
  'use strict';

  describe('Vendors Route Tests', function () {
    // Initialize global variables
    var $scope,
      VendorsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _VendorsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      VendorsService = _VendorsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('vendors');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/vendors');
        });

        it('Should be abstract', function () {
          expect(mainstate.abstract).toBe(true);
        });

        it('Should have template', function () {
          expect(mainstate.template).toBe('<ui-view/>');
        });
      });

      describe('View Route', function () {
        var viewstate,
          VendorsController,
          mockVendor;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('vendors.view');
          $templateCache.put('modules/vendors/client/views/view-vendor.client.view.html', '');

          // create mock Vendor
          mockVendor = new VendorsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Vendor Name'
          });

          // Initialize Controller
          VendorsController = $controller('VendorsController as vm', {
            $scope: $scope,
            vendorResolve: mockVendor
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:vendorId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.vendorResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            vendorId: 1
          })).toEqual('/vendors/1');
        }));

        it('should attach an Vendor to the controller scope', function () {
          expect($scope.vm.vendor._id).toBe(mockVendor._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/vendors/client/views/view-vendor.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          VendorsController,
          mockVendor;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('vendors.create');
          $templateCache.put('modules/vendors/client/views/form-vendor.client.view.html', '');

          // create mock Vendor
          mockVendor = new VendorsService();

          // Initialize Controller
          VendorsController = $controller('VendorsController as vm', {
            $scope: $scope,
            vendorResolve: mockVendor
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.vendorResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/vendors/create');
        }));

        it('should attach an Vendor to the controller scope', function () {
          expect($scope.vm.vendor._id).toBe(mockVendor._id);
          expect($scope.vm.vendor._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/vendors/client/views/form-vendor.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          VendorsController,
          mockVendor;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('vendors.edit');
          $templateCache.put('modules/vendors/client/views/form-vendor.client.view.html', '');

          // create mock Vendor
          mockVendor = new VendorsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Vendor Name'
          });

          // Initialize Controller
          VendorsController = $controller('VendorsController as vm', {
            $scope: $scope,
            vendorResolve: mockVendor
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:vendorId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.vendorResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            vendorId: 1
          })).toEqual('/vendors/1/edit');
        }));

        it('should attach an Vendor to the controller scope', function () {
          expect($scope.vm.vendor._id).toBe(mockVendor._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/vendors/client/views/form-vendor.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
