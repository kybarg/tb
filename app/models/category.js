var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var pictPath = require('../config/path.js').categoryPictPath;
var slugify = require('transliteration').slugify;
var streamWorker = require('stream-worker');
var picturePlugin = require('../models/picture.js');
var metaPlugin = require('../models/meta.js');

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
    popularity: []
});

categorySchema.plugin(mongoosePaginate);
categorySchema.plugin(picturePlugin, {
    pictPath: pictPath
});

categorySchema.plugin(metaPlugin);

/**
 * Pre-save middleware
 * Build or rebuild path when needed
 *
 * @param  {Function} next
 */
categorySchema.pre('save', function (next) {
    var isParentChange = this.isModified('parent');
    var isNameChange = this.isModified('name');
    var numWorkers = 5;

    if (this.isNew || isParentChange || isNameChange) {
        if (!this.parent) {
            this.ancestors = [{
                _id: this._id,
                name: this.name
            }];
            return next();
        }

        var self = this;
        this.collection.findOne({
            _id: this.parent
        }, function (err, parent) {

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
                }, function (err, cursor) {

                    if (err) {
                        return next(err);
                    }

                    streamWorker(cursor.stream(), function streamOnData(child, done) {

                            var newAncestors = [].concat(self.ancestors, child.ancestors.slice(previousAncestor.length));

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

/**
 * Pre-save middleware
 * Generate slug if empty
 *
 * @param  {Function} next
 */
categorySchema.pre('save', function (next, done) {
    if (!this.slug || this.slug.length === 0) {
        this.slug = slugify(this.name);
    }
    next();
});

module.exports = mongoose.model('Category', categorySchema);