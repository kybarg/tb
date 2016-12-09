var mongoose = require('mongoose');
var async = require('async');

var routeSchema = mongoose.Schema({
    alias: String,
    entityType: String,
    entityId: mongoose.Schema.Types.ObjectId
});



routeSchema.statics.addRoute = function (item) {
    var route = new this();
    route.entityType = item.constructor.modelName;
    route.entityId = item._id;
    route.alias = item.slug;
    route.save();
}

routeSchema.statics.generateRoutes = function (callback) {
    var self = this;
    async.each(["Product", "Category", "Shop", "Vendor"], function (item, callback) {
        mongoose.model(item).find({}, function (err, docs) {
            if (docs.length === 0) {
                return callback();
            }
            for (i = 0; i < docs.length; i++) {
                self.addRoute(docs[i]);
            }
            callback();
        });
    }, function () {
        callback();
    });
}

var routeModel = mongoose.model('Route', routeSchema);

var routePlugin = function (schema, opts) {
    schema.pre('save', function (next) {
        routeModel('Route', routeSchema).addRoute(this);
        next();
    });
}

module.exports = routeModel;
module.exports.routePlugin = routePlugin;