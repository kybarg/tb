var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var menuSchema = mongoose.Schema({
    name: String,
    systemName: String,
    links: [{
        title: String,
        url: String
    }]
});

menuSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Menu', menuSchema);