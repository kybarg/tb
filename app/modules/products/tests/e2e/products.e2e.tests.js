'use strict';

describe('Products E2E Tests:', function () {
  describe('Test Products page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/products');
      expect(element.all(by.repeater('product in products')).count()).toEqual(0);
    });
  });
});
