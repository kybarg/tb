var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var pictPath = require('../config/path.js').vendorPictPath;
var slugify = require('transliteration').slugify;
var picturePlugin = require('../models/picture.js');
var metaPlugin = require('../models/meta.js');

var vendorSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    synonyms: [String],
    slug: String,
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
vendorSchema.plugin(metaPlugin);

module.exports = mongoose.model('Vendor', vendorSchema);