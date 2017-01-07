var mongoose = require('mongoose');
var fs = require('fs');
var gm = require('gm');
var async = require('async');

module.exports = function picturePlugin(schema, opts) {
    schema.add({
        picture: [{
            name: String,
            color: String
        }]
    })

    schema.methods.addPicture = function (file) {
        if (file.filename) {
            this.picture.push({
                name: file.filename,
                color: null
            })
        }
    }

    schema.methods.removePicture = function (file) {
        var target = file.filename ? file.filename : file;
        for (var i = 0; i < this.picture.length; i++) {
            if (this.picture[i].name == target) {
                this.picture.splice(i, 1);
                break;
            }
        }
    }

    schema.virtual('pictureFile').set(function (f) {
        if (this.picture[0].name) {
            fs.unlink(opts.pictPath + this.picture[0].name, function (err) {});
        }
        if (f.filename) {
            this.picture[0] = {
                name: f.filename,
                color: null
            };
        }
    });

    schema.pre('save', function (next) {
        var savePict = function (pict, callback) {
            if (!pict.name || pict.color != null) {
                return callback();
            }
            gm(opts.pictPath + pict.name)
                .resize(250, 250)
                .colors()
                .toBuffer('RGB', function (error, buffer) {
                    pict.color = buffer.slice(0, 3).toString('hex');
                    callback();
                });
        }
        async.eachSeries(this.picture, function (pict, callback) {
            savePict(pict, callback);
        }, function () {
            next();
        });
    })


    schema.post('remove', function (doc) {
        for (var i = 0; i < this.picture.length; i++) {
            fs.unlink(opts.pictPath + doc.picture[i].name, function (err) {});
        }
    });
}