'use strict';


var importPolicy = require('../policies/import.server.policy'),
  importController = require('../controllers/import.server.controller');

module.exports = function (app) {
 
  app.route('/api/import/start/:id').all(importPolicy.isAllowed)
    .post(importController.start);

  app.route('/api/import/pause/:id').all(importPolicy.isAllowed)
    .post(importController.pause);

  app.route('/api/import/resume/:id').all(importPolicy.isAllowed)
    .post(importController.resume);    
  
  app.route('/api/import').all(importPolicy.isAllowed)
    .get(importController.list);

  app.route('/api/import/:Id').all(importPolicy.isAllowed)
    .get(importController.info);
 };
