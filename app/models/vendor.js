var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var pictPath = require('../config/path.js').vendorPictPath;
var slugify = require('transliteration').slugify;
var picturePlugin = require('../models/picture.js');

var vendorSchema = mongoose.Schema({
    name: String,
    description: String,
    synonyms: [String],
    slug: String,
    meta: {
        title: String,
        description: String
    }
});

vendorSchema.pre('save', function (next) {
    if (!this.slug || this.slug.length === 0) {
        this.slug = slugify(this.name);
    }
    next();
});

vendorSchema.plugin(mongoosePaginate);
vendorSchema.plugin(picturePlugin, {
    pictPath: pictPath
});

module.exports = mongoose.model('Vendor', vendorSchema);