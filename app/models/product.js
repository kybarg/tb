var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var fs = require('fs');
var pictPath = require('../config/path.js').productPictPath;

var productSchema = mongoose.Schema({
    name: String,
    description: String,
    category: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    price: Number,
    oldPrice: Number,
    alias: String,
    url: String,
    vendor: String,
    age: {
        type: Number,
        enum: [null, 1, 2, 3],
        default: null
    },
    color: [String],
    material: [String],
    size: [String], // need converter
    sex: {
        type: Number,
        enum: [null, 1, 2, 3],
        default: null
    },
    picture: String,
    season: String,
    shop: String,
    meta: {
        title: String,
        description: String
    }
});

productSchema.post('remove', function(doc) {
    console.log('Product removed, id = ' + doc._id);
    if (doc.picture)
        fs.unlink(pictPath + doc.picture);
});

productSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Product', productSchema);
