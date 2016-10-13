var mongoose = require('mongoose');

var productSchema = mongoose.Schema({
    name: String,
    description: String,
    category: [String],
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
    size: [String],     // need converter
    sex: {
        type: Number,
        enum: [null, 1, 2, 3],
        default: null
    },
    season: String,
    shop: String,
    meta:{
        title: String,
        desc: String
    }
});

module.exports = mongoose.model('Product', productSchema);

