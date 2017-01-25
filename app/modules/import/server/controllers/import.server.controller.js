'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  fs = require('fs'),
  path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mongoose = require('mongoose'),
  multer = require('multer'),
  config = require(path.resolve('./config/config')),
  Shop = mongoose.model('Shop'),
  FeedImport = require(path.resolve('./modules/import/lib/feed_import')),
  async = require('async');

var feedImportList = new Map();

exports.start = function (req, res) {
  var feedImport = new FeedImport(req.body); //body must be a shop
  feedImportList.set(req.body.id, feedImport);
  feedImport.downloadFeed(function () {
    feedImport.startImport();
  });

  function sendError(error) {
    res.status(422).send({
      status: 'failed',
      message: error,
      time: Date.now
    });
    feedImport.importStreamFile.removeListener('data', sendStarted)
  }

  function sendStarted() {
    res.json({
      status: feedImport.state,
      message: 'download started',
      time: feedImport.downloadstartdate
    });
    feedImport.removeListener('httpError', sendError);
  }

  feedImport.once('httpError', sendError);
  feedImport.importStreamFile.once('data', sendStarted)
};

exports.pause = function (req, res) {
  var feedImport = feedImportList.get(req.body.id);
  if (!feedImport) {
    return res.status(402).send({
      status: 'error',
      message: 'import object not found'
    });
  }
  feedImport.pause();
  res.json({
    status: feedImport.state,
  });
};

exports.resume = function (req, res) {
  var feedImport = feedImportList.get(req.body.id);
  if (!feedImport) {
    return res.status(402).send({
      status: 'error',
      message: 'import object not found'
    });
  }
  feedImport.resume();
  res.json({
    status: feedImport.state,
  });
}

exports.info = function (req, res) {
  var feedImport = feedImportList.get(req.body.id);
  if (!feedImport) {
    return res.status(402).send({
      status: 'error',
      message: 'import object not found'
    });
  }
  res.json(feedImport.getInfo());
}

exports.list = function (req, res) {
  Shop.find().exec(function (err, shops) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    var result = [];
    for (var i = 0; i < shops.length; i++) {
      var feed = feedImportList.get(shops[i].id);
      if (!feed) {
        feed = new FeedImport(shops[i]);
      }
      //shops[i].import = feed.getInfo();
      result.push({
        shop: shops[i],
        import: feed.getInfo()
      })
    }
    res.json({
      items: result,
      count: shops.length
    })
  });
}
