'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  path = require('path'),
  Schema = mongoose.Schema,
  slugify = require('transliteration').slugify,
  config = require(path.resolve('./config/config')),
  metaPlugin = require(path.resolve('./modules/meta/server/models/meta.server.model')),
  picturePlugin = require(path.resolve('./modules/pictures/server/models/pictures.server.model'));

/**
 * Category Schema
 */
var CategorySchema = new Schema({
  name: {
    type: String,
    required: 'Please fill Category name',
    trim: true
  },
  description: String,
  slug: String,
  parent: {
    type: Schema.ObjectId,
    ref: 'Category',
    index: true
  },
  created: {
    type: Date,
    default: Date.now
  }
});

/**
 * Meta Title/Description middleware
 */
CategorySchema.plugin(metaPlugin);

/**
 * Picture upload middleware
 */
CategorySchema.plugin(picturePlugin, {
  picturesPath: path.resolve(config.uploads.category.image.dest)
});

/**
 * Pre-save middleware
 * Generate slug if empty
 *
 * @param  {Function} next
 */
CategorySchema.pre('save', function (next, done) {
  if (!this.slug || this.slug.length === 0) {
    this.slug = slugify(this.name);
  }
  next();
});

mongoose.model('Category', CategorySchema);
