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
        type: String,
        enum: ['child', 'adult', 'kid', 'none'],
        default: 'none'
    },
    color: String,
    material: String,
    size: String,     // need converter
    sex: {
        type: String,
        enum: ['male', 'female', 'unisex'],
        default: 'unisex'
    },
    season: String,
    shop: Number,
    meta:{
        title: String,
        desc: String
    }
});

module.exports = mongoose.model('Product', productSchema);

