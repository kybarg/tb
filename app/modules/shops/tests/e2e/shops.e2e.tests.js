'use strict';

describe('Shops E2E Tests:', function () {
  describe('Test Shops page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/shops');
      expect(element.all(by.repeater('shop in shops')).count()).toEqual(0);
    });
  });
});
