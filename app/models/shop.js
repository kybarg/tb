var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var shopSchema = mongoose.Schema({
    name: String,
    description: String,
    feedUrl: String,
    picture: String,
    meta: {
        title: String,
        description: String
    }
});

shopSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Shop', shopSchema); 

