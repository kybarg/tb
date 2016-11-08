var mongoose = require('mongoose');
var async = require('async');

var defTemplate = {
    title: {
        template: "it's called [name]"
    },
    description: {
        template: "it's called [name]"
    }
};
var replaceWith = {}

module.exports = function metaPlugin(schema, opts) {
    schema.add({
        meta: {
            title: String,
            description: String
        }
    })

    schema.virtual('meta.title.template').set(function (template) {
        opts.title = template;
    })

    schema.virtual('meta.description.template').set(function (template) {
        opts.description = template;
    })

    schema.methods.generateMetaField = function (template, callback) {
        var self = this;
        var resultString = template.replace(/\[([\w|\.]+)\]/g, function (match, propName) {
            if (propName.indexOf('.') !== -1) {
                var paths = propName.split('.');

                var current = self;
                for (i = 0; i < paths.length; i++) {
                    if (self[paths[i]] === undefined) {
                        return undefined;
                    } else {
                        current = current[paths[i]];
                    }
                }
                return current;
            } else {
                if (self[propName]) {
                    return self[propName];
                }
            }
        });
        callback(null, resultString);
    }

    schema.methods.generateMeta = function (cb) {
        var template = (opts || defTemplate);
        var self = this;
        async.parallel({
                title: function (callback) {
                    self.generateMetaField(template.title.template, callback)
                },
                description: function (callback) {
                    self.generateMetaField(template.description.template, callback)
                }
            },
            function (err, result) {
                self.meta = result;
                if (cb) {
                    cb(err);
                }
            });
    }

    schema.pre('save', function (next) {
        this.generateMeta(function (err) {
            next();
        });
    });
}