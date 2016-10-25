var mongoose = require('mongoose');
var fs = require('fs');

module.exports = function picturePlugin(schema, opts) {
    schema.add({
        picture: {
            name: String,
            color: String
        }
    })

    schema.virtual('pictureFile').set(function (f) {
        if (this.picture.name) {
            fs.unlink(opts.pictPath + this.picture.name, function (err) {});
        }
        if (f.filename) {
            this.picture.name = f.filename
        }

    })

    schema.post('remove', function (doc) {
        if (doc.picture.name)
            fs.unlink(opts.pictPath + doc.picture.name, function (err) {});
    });
}