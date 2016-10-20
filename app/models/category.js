var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var fs = require('fs');
var pictPath = require('../config/path.js').categoryPictPath;
var slugify = require('transliteration').slugify;
var streamWorker = require('stream-worker');

var categorySchema = mongoose.Schema({
    name: String,
    description: String,
    slug: String,
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        index: true
            //set: 
            //  }
    },
    ancestors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    path: {
        type: String,
        index: true
    },
    root: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        index: true
    },
    depth: Number,
    picture: String,
    popularity: [],
    meta: {
        title: String,
        description: String
    }
});

categorySchema.plugin(mongoosePaginate);

categorySchema.post('remove', function (doc) {
    console.log('Category removed, id = ' + doc._id);
    if (doc.picture)
        fs.unlink(pictPath + doc.picture);
});

/**
 * Pre-save middleware
 * Build or rebuild path when needed
 *
 * @param  {Function} next
 */
/**categorySchema.pre('save', function preSave(next) {
    var isParentChange = this.isModified('parent');
    var pathSeparator = '#';
    var pathSeparatorRegex = '[' + pathSeparator + ']';
    var numWorkers = 5;

    if (this.isNew || isParentChange) {
        if (!this.parent) {
            this.path = this._id.toString();
            this.root = this._id;
            return next();
        }

        var self = this;
        this.collection.findOne({
            _id: this.parent
        }, function(err, doc) {

            if (err) {
                return next(err);
            }

            var previousPath = self.path;
            self.path = doc.path + pathSeparator + self._id.toString();
            self.ancestors = self.path.split(pathSeparator);
            self.ancestors.pop();
            self.root = self.ancestors[0];
            self.depth = self.ancestors.length;

            if (isParentChange) {
                // When the parent is changed we must rewrite all children paths as well
                self.collection.find({
                    path: {
                        '$regex': '^' + previousPath + pathSeparatorRegex
                    }
                }, function(err, cursor) {

                    if (err) {
                        return next(err);
                    }

                    streamWorker(cursor.stream(), function streamOnData(doc, done) {

                            var newPath = self.path + doc.path.substr(previousPath.length);
                            var newAncestors = newPath.split(pathSeparator);
                            newAncestors.pop();
                            var root = newAncestors[0];
                            var depth = newAncestors.length;
                            self.collection.update({
                                _id: doc._id
                            }, {
                                $set: {
                                    path: newPath,
                                    ancestors: newAncestors,
                                    root: root,
                                    depth: depth,
                                }
                            }, done);
                        }, {
                            promises: false,
                            concurrency: numWorkers
                        },
                        next);
                });
            } else {
                next();
            }
        });
    } else {
        next();
    }
});*/

// categorySchema.pre('save', function(next, done) {
//
//     var self = this;
//     var isParentChanged = self.isModified('parent');
//
//     // updates do not affect structure
//     if (!self.isNew && !isParentChanged) {
//         return next();
//     }
//
//     // if create new element
//     if ((self.isNew && self.parent) || (!self.isNew && isParentChanged)) {
//         self.constructor.findById(self.parent)
//             .populate('ancestors')
//             .exec(function(err, parent) {
//                 if (err || !parent) {
//                     self.invalidate('parent', 'Parent not found!');
//                     return done(new Error('Parent not found!'));
//                 }
//                 // self.path = ",";
//                 if (parent.ancestors && parent.ancestors.length > 0) {
//                     self.ancestors = [];
//                     parent.ancestors.forEach(function(element) {
//                         self.ancestors.push(element._id);
//                         // self.path += element.name + ",";
//                     });
//                     self.ancestors.push(parent._id);
//                 } else {
//                     self.ancestors = [parent._id];
//                 }
//                 // self.path += self.name + ",";
//                 next();
//             });
//         return;
//     } else if (!self.parent || self.parent.length === 0) {
//         // self.path = "," + self.name + ",";
//         next();
//     } else {
//         next();
//     }
//
// });

categorySchema.pre('save', function (next, done) {
    if (!this.slug || !this.slug.length === 0) {
        this.slug = slugify(this.name);
    }
    next();
});


// temp solution
categorySchema.methods.updateAndSave = function (callback) {
    var category = this;
    if (this.isModified('parent')) {
        this.ancestors = [this.parent];
        mongoose.model('Category').findById(this.parent, function (err, doc) {
            if (doc.ancestors.length > 0)
                category.ancestors.push(doc.ancestors);
            category.save(function (err) {
                callback(err, category);
            });
        })
    } else {
        this.save(function (err) {
            callback(err, category)
        });
    }
}



module.exports = mongoose.model('Category', categorySchema);
