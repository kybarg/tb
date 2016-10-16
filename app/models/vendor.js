var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var vendorSchema = mongoose.Schema({
    name: String,
    description: String, 
    synonyms: [String],
    picture: String,
    meta: {
        title: String,
        description: String
    }
});

vendorSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Vendor', vendorSchema);