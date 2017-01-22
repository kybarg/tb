(function (app) {
  'use strict';

  // app.registerModule('vendors');

  app.registerModule('vendors', ['core']);
  app.registerModule('vendors.services');
  app.registerModule('vendors.routes', ['ui.router', 'core.routes', 'vendors.services']);
}(ApplicationConfiguration));
