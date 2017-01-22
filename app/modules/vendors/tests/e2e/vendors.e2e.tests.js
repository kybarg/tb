'use strict';

describe('Vendors E2E Tests:', function () {
  describe('Test Vendors page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/vendors');
      expect(element.all(by.repeater('vendor in vendors')).count()).toEqual(0);
    });
  });
});
