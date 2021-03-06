var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var pictPath = require('../config/path.js').productPictPath;
var slugify = require('transliteration').slugify;
var picturePlugin = require('../models/picture.js');
var metaPlugin = require('../models/meta.js');
var settingsMem = require('../config/admin_config.js').stores.memory;

var productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    category: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    price: Number,
    oldPrice: Number,
    slug: String,
    url: {
        type: String,
        required: true
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor'
    },
    age: {
        type: Number,
        enum: [null, 1, 2, 3],
        default: null
    },
    color: {
        type: [String],
        default: void 0
    },
    material: [String],
    size: [String], // need converter
    sex: {
        type: Number,
        enum: [null, 1, 2, 3],
        default: null
    },
    season: String,
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop'
    },
}, {minimize: false});

productSchema.pre('save', function (next) {
    var self = this;
    //populate for meta generation
    this.populate(['category', 'vendor', 'shop'], function (err) {
        if (!this.slug || this.slug.length === 0) {
            var vendorName = (!self.vendor) ? "" : "-" + self.vendor.name;
            self.slug = 'product-' + slugify(self.name + vendorName + '-' + self._id);
            next();
        } else {
            next();
        }
    })
});



productSchema.plugin(mongoosePaginate);
productSchema.plugin(picturePlugin, {
    pictPath: pictPath
});
productSchema.plugin(metaPlugin, settingsMem.get('admin.product.meta'));

module.exports = mongoose.model('Product', productSchema);