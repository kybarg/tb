var mongoose = require('mongoose');
var fs = require('fs');

var pictureSchema = mongoose.Schema({
    name: String,
    color: String
});

pictureSchema.virtual('file').set(function (f) {
    if (this.name != f.filename) {
        if (this.name) {
            fs.unlink(pictPath + doc.picture.name, function (err) {});
        }
        this.name = f.filename
    }
})

module.exports = pictureSchema;