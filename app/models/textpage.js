var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var textPageSchema = mongoose.Schema({
    name: String,
    body: String,
    slug: String,
    meta: {
        title: String,
        description: String
    }
});

textPageSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('TextPage', textPageSchema);