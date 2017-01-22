'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Vendor Schema
 */
var VendorSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Vendor name',
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

mongoose.model('Vendor', VendorSchema);
