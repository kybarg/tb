var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var fs = require('fs');
var pictPath = require('../config/path.js').categoryPictPath;
var slugify = require('transliteration').slugify;
var streamWorker = require('stream-worker');

var categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    slug: String,
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        index: true
    },
    ancestors: [{
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category'
        },
        name: String
    }],
    picture: String,
    popularity: [],
    meta: {
        title: String,
        description: String
    }
});

categorySchema.plugin(mongoosePaginate);

categorySchema.post('remove', function(doc) {
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
categorySchema.pre('save', function(next) {
    var isParentChange = this.isModified('parent');
    var isNameChange = this.isModified('name');
    var numWorkers = 5;

    if (this.isNew || isParentChange || isNameChange) {
        if (!this.parent) {
            // this.ancestors = [];
            this.ancestors = [{
                _id: this._id,
                name: this.name
            }];
            return next();
        }

        var self = this;
        this.collection.findOne({
            _id: this.parent
        }, function(err, parent) {

            if (err) {
                return next(err);
            }

            var previousAncestor = self.ancestors;

            self.ancestors = [].concat(parent.ancestors, {
                _id: self._id,
                name: self.name
            });

            if (isParentChange || isNameChange) {

                // When the parent is changed we must rewrite all children paths as well
                self.collection.find({
                    ancestors: {
                        $elemMatch: {
                            _id: self._id
                        }
                    }
                }, function(err, cursor) {

                    if (err) {
                        return next(err);
                    }

                    streamWorker(cursor.stream(), function streamOnData(child, done) {

                            // var newAncestors = [].concat(self.ancestors, child.ancestors.slice(previousAncestor.length));
                            var newAncestors = [].concat(self.ancestors, child.ancestors.slice(previousAncestor.length));

                            console.log(newAncestors);

                            self.collection.update({
                                _id: child._id
                            }, {
                                $set: {
                                    ancestors: newAncestors,
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
});

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

categorySchema.pre('save', function(next, done) {
    if (!this.slug || this.slug.length === 0) {
        this.slug = slugify(this.name);
    }
    next();
});



module.exports = mongoose.model('Category', categorySchema);