var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var fs = require('fs');
var pictPath = require('../config/path.js').categoryPictPath;
var slugify = require('transliteration').slugify;


var categorySchema = mongoose.Schema({
    name: String,
    description: String,
    slug: String,
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    ancestors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    picture: String,
    popularity: [],
    meta: {
        title: String,
        description: String
    }
});

categorySchema.post('remove', function (doc) {
    console.log('Category removed, id = ' + doc._id);
    if (doc.picture)
        fs.unlink(pictPath + doc.picture);
});

categorySchema.pre('save', function (doc) {
    if (!doc.slug || doc.slug.length === 0) {
        doc.slug = slugify(doc.name);
    }
});

categorySchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Category', categorySchema);