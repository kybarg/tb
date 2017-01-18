'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  path = require('path'),
  Schema = mongoose.Schema,
  slugify = require('transliteration').slugify,
  metaPlugin = require(path.resolve('./modules/meta/server/models/meta.server.model'));

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
  }
});

/**
 * Meta Title/Description middleware
 */
CategorySchema.plugin(metaPlugin);

/**
 * Pre-save middleware
 * Generate slug if empty
 *
 * @param  {Function} next
 */
CategorySchema.pre('save', function (next, done) {
  if (!this.slug || this.slug.length == 0) {
    this.slug = slugify(this.name);
  }
  next();
});

mongoose.model('Category', CategorySchema);
