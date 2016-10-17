var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var fs = require('fs');
var pictPath = require('../config/path.js').categoryPictPath;

var categorySchema = mongoose.Schema({
    name: String,
    description: String,
    alias: String,
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    picture: String,
    popularity: [],
    meta: {
        title: String,
        description: String
    }
});

categorySchema.index({name: 'text'});

categorySchema.post('remove', function(doc) {
    console.log('Category removed, id = ' + doc._id);
    if (doc.picture)
        fs.unlink(pictPath + doc.picture);
});

categorySchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Category', categorySchema);
