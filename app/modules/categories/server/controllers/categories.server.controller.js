'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  async = require('async'),
  Category = mongoose.model('Category'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Category
 */
exports.create = function (req, res) {
  var category = new Category(req.body);

  category.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(category);
    }
  });
};

/**
 * Show the current Category
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var category = req.category ? req.category.toJSON() : {};

  res.jsonp(category);
};

/**
 * Update a Category
 */
exports.update = function (req, res) {
  var category = req.category;

  category = _.extend(category, req.body);

  category.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(category);
    }
  });
};

/**
 * Delete an Category
 */
exports.delete = function (req, res) {
  var category = req.category;

  category.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(category);
    }
  });
};

/**
 * List of Categories
 */
exports.list = function (req, res) {
  var sort = req.query.sort ? req.query.sort : 'path';
  // var sortParam = sort.replace('-', '');
  // sort = 'path';
  var page = req.query.page ? parseInt(req.query.page, 10) : 1;
  var limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
  // var match = req.query.match ? req.query.match : {};
  var match = {};
  if (req.query.name) {
    match.name = {
      '$regex': req.query.name,
      '$options': 'i'
    };
  } else if (req.query.parent !== undefined) {
    match.parent = req.query.parent ? req.query.parent : null;
  }

  // Maybe there less ugly way to solve sorting
  // if (req.query.sort === 'name') {
  //   sort = 'ancestors.0.name';
  // } else if (req.query.sort === '-name') {
  //   sort = '-ancestors.name';
  // }

  async.parallel([function (callback) {
    Category.count(function (err, count) {
      callback(err, count);
    });
  }, function (callback) {
    // Category.find(filter).skip((page - 1) * limit).limit(limit).sort(sort).exec(function (err, categories) {
    //   callback(err, categories);
    // });
    Category.aggregate([{
      $match: match
    }, {
      $graphLookup: {
        from: "categories",
        startWith: "$parent",
        connectFromField: "parent",
        connectToField: "_id",
        as: "ancestors"
      }
    }, {
      "$project": {
        "_id": 1,
        "name": 1,
        "description": 1,
        "slug": 1,
        "created": 1,
        "parent": 1,
        "ancestors": 1,
        "path": {
          "$concatArrays": [
            {
              "$map": {
                "input": "$ancestors",
                "as": "a",
                "in": ["$$a.name", "$$a._id"]
              }
            },
            [["$name", "$_id"]]
          ]
        }
      }
    }]).sort(sort).skip((page - 1) * limit).limit(limit).exec(function (err, categories) {
      callback(err, categories);
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
 * Category middleware
 */
exports.categoryByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Category is invalid'
    });
  }

  Category.findById(id).populate('parent').exec(function (err, category) {
    if (err) {
      return next(err);
    } else if (!category) {
      return res.status(404).send({
        message: 'No Category with that identifier has been found'
      });
    }
    req.category = category;
    next();
  });
};
