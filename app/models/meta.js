var mongoose = require('mongoose');
var async = require('async');


var defTemplate = "it's called [name]";
var replaceWith = {}

module.exports = function metaPlugin(schema, opts) {
    schema.add({
        meta: {
            title: String,
            description: String
        }
    })

    schema.virtual('meta.title.template').set(function (template) {
        opts.title.template = template;
    })

    schema.virtual('meta.description.template').set(function (template) {
        opts.description.template = template;
    })

    schema.methods.generateMeta = function (options, cb) {
        if (opts) {
            var template = (opts.template || opts.defTemplate || defTemplate)
        } else {
            var template = defTemplate
        }
        this.meta = {
            title: "",
            description: ""
        }

        var replaceName = "/" + this.constructor.modelName.toLowerCase() + "./g";
        template = template.replace(replaceName, "");
        // template.replace(/([*\[\]])/g, "") 
        var resultString = template.replace(/\[(\w+)\]/g, function (match1, match2) {
            return replaceWith[match2];
        });

        // var fields = this.schema.paths;
        var self = this;
        var templateArr = template.split(" ");
        var finalTemplate = "";

        var replaceWithField = function (field) {
            if (field.search("]") != -1) {
                var prop = field.replace(/([*\[\]])/g, "")
                var props = prop.split(".")
                if (self[props[0]]) {
                    field = self[props[0]]
                    props.forEach(function (item, i) {
                        if (i != 0) {
                            field = field[item]
                        }
                    })
                }
            }
            finalTemplate = finalTemplate.concat([field + " "])
        }
        async.each(templateArr, function (item, callback) {
            replaceWithField(item);
            callback()
        }, function (err) {
            self.meta.title = finalTemplate;
            if (typeof cb === 'function') {
                cb(err)
            }
        })
    }

    schema.pre('save', function (next) {
        this.generateMeta({}, function (err) {
            next()
        });
        // next();
    })
}