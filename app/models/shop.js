var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var pictPath = require('../config/path.js').shopPictPath;
var slugify = require('transliteration').slugify;
var picturePlugin = require('../models/picture.js');
var metaPlugin = require('../models/meta.js');


var shopSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    lastUpdate: Date, 
    description: String,
    feedUrl: String,
    slug: String
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
shopSchema.plugin(metaPlugin);


module.exports = mongoose.model('Shop', shopSchema);