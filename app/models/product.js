var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var fs = require('fs');

var productSchema = mongoose.Schema({
    name: String,
    description: String,
    category: [String],
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
        fs.unlink(__dirname + '/../public/uploads/' + doc.picture);
});

productSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Product', productSchema);

/* TODO
/* Sort fields for better reading
/* File upload callback for picture field with image resize
/* https://www.npmjs.com/package/mongoose-file - file upload
/* https://www.npmjs.com/package/lwip - image operations
/* Need to add timestamp field of 'last edit time' OR if possible get it from ObjectID
/* Not sure about Category/Vendor/Shop field type - it will store ObjectIDs. Is it String?
*/
