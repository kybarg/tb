var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var fs = require('fs');
var pictPath = require('../config/path.js').productPictPath;
var slugify = require('transliteration').slugify;

var productSchema = mongoose.Schema({
    name: String,
    description: String,
    category: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    price: Number,
    oldPrice: Number,
    slug: String,
    url: String,
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor'
    },
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

productSchema.pre('save', function(next) {
    if (!this.slug || this.slug.length === 0) {
        mongoose.model('Vendor').findById(doc._id, function(err, vendor) {
            if (!err || vendor) {
                doc.slug = 'product-' + slugify(doc.name + '-' + vendor.name) + '-' + doc._id;
            }
        });
    }
});


productSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Product', productSchema);
