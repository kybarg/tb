var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var pictPath = require('../config/path.js').productPictPath;
var slugify = require('transliteration').slugify;
var picturePlugin = require('../models/picture.js');
var metaPlugin = require('../models/meta.js');
var settingsMem = require('../config/admin_config.js').stores.memory;


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
    season: String,
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop'
    },
});


/**
 * Pre-save middleware
 * Generate slug if empty
 *
 * @param  {Function} next
 */
productSchema.pre('save', function (next) {
    if (!this.slug || this.slug.length === 0) {
        var self = this;
        mongoose.model('Vendor').findById(this.vendor, function (err, vendor) {
            if (!err && vendor) {
                self.slug = 'product-' + slugify(self.name + '-' + vendor.name) + '-' + self._id;
            }
        });
    }
   next();
});


productSchema.plugin(mongoosePaginate);
productSchema.plugin(picturePlugin, {
    pictPath: pictPath
});
productSchema.plugin(metaPlugin, settingsMem.get('admin.product.meta'));

module.exports = mongoose.model('Product', productSchema);