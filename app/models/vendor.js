var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var fs = require('fs');
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

vendorSchema.post('remove', function (doc) {
    console.log('Category removed, id = ' + doc._id);
    if (doc.picture)
        fs.unlink(pictPath + doc.picture);
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