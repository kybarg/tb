(function (app) {
  'use strict';

  app.registerModule('core', ['textAngular']);
  app.registerModule('core.routes', ['ui.router']);
}(ApplicationConfiguration));
