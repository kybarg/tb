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

    schema.methods.generateMetaField = function (template) {
        var replaceName = "/" + this.constructor.modelName.toLowerCase() + "./g";
        template = template.replace(replaceName, "");
        var self = this;
        var templateArr = template.split(" ");
        var result = "";
        var replaceWithField = function (field) {
            if (field.search("]") != -1) {
                var prop = field.replace(/([*\[\]])/g, "")
                var props = prop.split(".")
                if (self[props[0]]) {
                    field = self[props[0]]
                    props.forEach(function (item, i) {
                        if (i != 0) {
                            field = field[item];
                        }
                    })
                }
            }
            result = result.concat([field + " "]);
        }

        templateArr.forEach(function (item) {
            replaceWithField(item);
        })
        return result;
    }

    schema.methods.generateMeta = function (cb) {
        var template = (opts || defTemplate);
        var self = this;
        async.parallel({
                title: function (callback) {
                    callback(null, self.generateMetaField(template.title.template))
                },
                description: function (callback) {
                    callback(null, self.generateMetaField(template.description.template))
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
            next()
        });
    })
}