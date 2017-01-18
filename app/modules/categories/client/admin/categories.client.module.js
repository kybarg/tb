(function (app) {
  'use strict';

  app.registerModule('categories', ['core']);
  app.registerModule('categories.services');
  app.registerModule('categories.routes', ['ui.router', 'core.routes', 'categories.services']);
}(ApplicationConfiguration));
