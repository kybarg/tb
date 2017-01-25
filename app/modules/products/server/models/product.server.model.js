'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  path = require('path'),
  config = require(path.resolve('./config/config')),
  picturePlugin = require(path.resolve('./modules/pictures/server/models/pictures.server.model'));

/**
 * Product Schema
 */
var ProductSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Product name',
    trim: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

ProductSchema.plugin(picturePlugin, {
  picturesPath: path.resolve(config.uploads.product.image.dest)
});

mongoose.model('Product', ProductSchema);
