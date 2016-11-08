var mongoose = require('mongoose');
var fs = require('fs');
var gm = require('gm');

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
            this.picture.name = f.filename;
            this.picure.color = ""; 
        }
    });

    schema.pre('save', function (next) {
        if (!this.picture.name || this.picture.name != ""){
            return next();
        }
        var self = this;
        gm(opts.pictPath + self.picture.name)
            .resize(250, 250)
            .colors()
            .toBuffer('RGB', function (error, buffer) {
                self.picture.color = buffer.slice(0, 3).toString('hex');
                next();
            });
    })

    schema.post('remove', function (doc) {
        if (doc.picture.name)
            fs.unlink(opts.pictPath + doc.picture.name, function (err) {});
    });
}