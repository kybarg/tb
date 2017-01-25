(function () {
  'use strict';

  describe('Shops Route Tests', function () {
    // Initialize global variables
    var $scope,
      ShopsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _ShopsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      ShopsService = _ShopsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('shops');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/shops');
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
          ShopsController,
          mockShop;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('shops.view');
          $templateCache.put('modules/shops/client/views/view-shop.client.view.html', '');

          // create mock Shop
          mockShop = new ShopsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Shop Name'
          });

          // Initialize Controller
          ShopsController = $controller('ShopsController as vm', {
            $scope: $scope,
            shopResolve: mockShop
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:shopId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.shopResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            shopId: 1
          })).toEqual('/shops/1');
        }));

        it('should attach an Shop to the controller scope', function () {
          expect($scope.vm.shop._id).toBe(mockShop._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/shops/client/views/view-shop.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          ShopsController,
          mockShop;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('shops.create');
          $templateCache.put('modules/shops/client/views/form-shop.client.view.html', '');

          // create mock Shop
          mockShop = new ShopsService();

          // Initialize Controller
          ShopsController = $controller('ShopsController as vm', {
            $scope: $scope,
            shopResolve: mockShop
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.shopResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/shops/create');
        }));

        it('should attach an Shop to the controller scope', function () {
          expect($scope.vm.shop._id).toBe(mockShop._id);
          expect($scope.vm.shop._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/shops/client/views/form-shop.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          ShopsController,
          mockShop;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('shops.edit');
          $templateCache.put('modules/shops/client/views/form-shop.client.view.html', '');

          // create mock Shop
          mockShop = new ShopsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Shop Name'
          });

          // Initialize Controller
          ShopsController = $controller('ShopsController as vm', {
            $scope: $scope,
            shopResolve: mockShop
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:shopId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.shopResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            shopId: 1
          })).toEqual('/shops/1/edit');
        }));

        it('should attach an Shop to the controller scope', function () {
          expect($scope.vm.shop._id).toBe(mockShop._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/shops/client/views/form-shop.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
