var mongoose = require('mongoose');

var importSchema = mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    groupId: String,
    offers: [{
        id: String,
        diff: Object
    }]
});

// importSchema.pre('remove', function(next) {
//     // Remove reference product
//     this.model('Product').remove({ _id: this.offers[0].id }, next);
// });

module.exports = mongoose.model('Import', importSchema);