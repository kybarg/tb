var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var pictPath = require('../config/path.js').shopPictPath;
var slugify = require('transliteration').slugify;
var picturePlugin = require('../models/picture.js');

var shopSchema = mongoose.Schema({
    name: String,
    description: String,
    feedUrl: String,
    slug: String,
    meta: {
        title: String,
        description: String
    }
});

shopSchema.pre('save', function (next) {
    if (!this.slug || this.slug.length === 0) {
        this.slug = slugify(this.name);
    }
    next();
});

shopSchema.plugin(mongoosePaginate);
shopSchema.plugin(picturePlugin, {
    pictPath: pictPath
});

module.exports = mongoose.model('Shop', shopSchema);