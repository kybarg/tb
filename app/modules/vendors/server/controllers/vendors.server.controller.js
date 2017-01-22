'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  async = require('async'),
  Vendor = mongoose.model('Vendor'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Vendor
 */
exports.create = function(req, res) {
  var vendor = new Vendor(req.body);
  vendor.user = req.user;

  vendor.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(vendor);
    }
  });
};

/**
 * Show the current Vendor
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var vendor = req.vendor ? req.vendor.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  vendor.isCurrentUserOwner = req.user && vendor.user && vendor.user._id.toString() === req.user._id.toString();

  res.jsonp(vendor);
};

/**
 * Update a Vendor
 */
exports.update = function(req, res) {
  var vendor = req.vendor;

  vendor = _.extend(vendor, req.body);

  vendor.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(vendor);
    }
  });
};

/**
 * Delete an Vendor
 */
exports.delete = function(req, res) {
  var vendor = req.vendor;

  vendor.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(vendor);
    }
  });
};

/**
 * List of Vendors
 */
exports.list = function(req, res) {

  async.parallel([function (callback) {
    Vendor.count(function (err, count) {
      callback(err, count);
    });
  }, function (callback) {
    Vendor.find().sort('-created').populate('user', 'displayName').exec(function(err, vendors) {
      callback(err, count);
    });
  }], function (err, results) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json({
        items: results[1],
        count: results[0]
      });
    }
  });
};
/**
 * Vendor middleware
 */
exports.vendorByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Vendor is invalid'
    });
  }

  Vendor.findById(id).populate('user', 'displayName').exec(function (err, vendor) {
    if (err) {
      return next(err);
    } else if (!vendor) {
      return res.status(404).send({
        message: 'No Vendor with that identifier has been found'
      });
    }
    req.vendor = vendor;
    next();
  });
};
