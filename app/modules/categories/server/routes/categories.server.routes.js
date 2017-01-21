'use strict';

/**
 * Module dependencies
 */
var categoriesPolicy = require('../policies/categories.server.policy'),
  categories = require('../controllers/categories.server.controller');

module.exports = function (app) {
  // Categories collection routes
  app.route('/api/categories').all(categoriesPolicy.isAllowed)
    .get(categories.list)
    .post(categories.create);

  // Single category routes
  app.route('/api/categories/:categoryId').all(categoriesPolicy.isAllowed)
    .get(categories.read)
    .put(categories.update)
    .delete(categories.delete);

  // Category pictures routes
  app.route('/api/categories/:categoryId/pictures').all(categoriesPolicy.isAllowed)
    .post(categories.uploadPicture);

  // Single category routes
  app.route('/api/categories/:categoryId/pictures/:pictureId').all(categoriesPolicy.isAllowed)
    .delete(categories.deletePicture);

  // Finish by binding the Category middleware
  app.param('categoryId', categories.categoryByID);
};
