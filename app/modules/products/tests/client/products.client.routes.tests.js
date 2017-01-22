(function () {
  'use strict';

  describe('Products Route Tests', function () {
    // Initialize global variables
    var $scope,
      ProductsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _ProductsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      ProductsService = _ProductsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('products');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/products');
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
          ProductsController,
          mockProduct;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('products.view');
          $templateCache.put('modules/products/client/views/view-product.client.view.html', '');

          // create mock Product
          mockProduct = new ProductsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Product Name'
          });

          // Initialize Controller
          ProductsController = $controller('ProductsController as vm', {
            $scope: $scope,
            productResolve: mockProduct
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:productId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.productResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            productId: 1
          })).toEqual('/products/1');
        }));

        it('should attach an Product to the controller scope', function () {
          expect($scope.vm.product._id).toBe(mockProduct._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/products/client/views/view-product.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          ProductsController,
          mockProduct;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('products.create');
          $templateCache.put('modules/products/client/views/form-product.client.view.html', '');

          // create mock Product
          mockProduct = new ProductsService();

          // Initialize Controller
          ProductsController = $controller('ProductsController as vm', {
            $scope: $scope,
            productResolve: mockProduct
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.productResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/products/create');
        }));

        it('should attach an Product to the controller scope', function () {
          expect($scope.vm.product._id).toBe(mockProduct._id);
          expect($scope.vm.product._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/products/client/views/form-product.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          ProductsController,
          mockProduct;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('products.edit');
          $templateCache.put('modules/products/client/views/form-product.client.view.html', '');

          // create mock Product
          mockProduct = new ProductsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Product Name'
          });

          // Initialize Controller
          ProductsController = $controller('ProductsController as vm', {
            $scope: $scope,
            productResolve: mockProduct
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:productId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.productResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            productId: 1
          })).toEqual('/products/1/edit');
        }));

        it('should attach an Product to the controller scope', function () {
          expect($scope.vm.product._id).toBe(mockProduct._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/products/client/views/form-product.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());
