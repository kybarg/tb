var handlebarsPaginate = require('handlebars-paginate');
var mongoose = require('mongoose');
var multer = require('multer');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var Category = require('../../models/category');
var pictPath = require('../../config/path.js').categoryPictPath;

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, pictPath)
    },
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            if (err) return cb(err)
            cb(null, raw.toString('hex') + Date.now().toString() + path.extname(file.originalname))
        })
    }
});

var upload = multer({
    storage: storage
});

module.exports = function (app, passport, exphbs) {

    app.get('/admin/category/index', isLoggedIn, function (req, res) {

        req.breadcrumbs('Categories');

        // Using paginate for simplier pagination
        Category.paginate({}, {
            page: req.query.page ? req.query.page : 1,
            sort: '-_id',
            limit: 50
        }, function (err, result) {
            if (!err) {
                res.render('category/index', {
                    breadcrumbs: req.breadcrumbs(),
                    categories: result.docs,
                    pagination: {
                        page: result.page,
                        pageCount: result.pages
                    },
                    showPagination: result.pages > 1 ? true : false,
                    helpers: {
                        paginate: handlebarsPaginate
                    }
                });
            } else {
                throw err;
            }
        });
    });

    app.get('/admin/category/create', isLoggedIn, function (req, res) {
        req.breadcrumbs([{
            name: 'Categories',
            url: '/admin/category/index'
        }, {
            name: 'New category'
        }]);

        res.render('category/create', {
            breadcrumbs: req.breadcrumbs()
        });
    });

    app.post('/admin/category/create', isLoggedIn, upload.single('image'), function (req, res) {
        category = new Category(req.body.category);
        if (req.file) {
            category.picture = req.file.filename; // Store uploaded picture filename
        };

        if (category.parent) {
            Category.findById(catogory.parent._id, function (err, doc) {
                category.ancestors.push(doc.ancestors);
                category.ancestors.push(doc._id);
            });
        };

        category.save(function (err, category) {
            if (err) throw err;
            console.log('Category added, id = ' + category._id);
            res.redirect('/admin/category/update/' + category._id);
        });
    });

    app.get('/admin/category/update/:id', isLoggedIn, function (req, res) {
        Category.findOne({
            _id: mongoose.Types.ObjectId(req.params.id)
        })
        .populate('ancestors')
        .populate('parent')
        .exec(function(err, category) {

            req.breadcrumbs([{
                name: 'Categories',
                url: '/admin/category/index'
            }, {
                name: category.name
            }]);

            res.render('category/create', {
                breadcrumbs: req.breadcrumbs(),
                category: category
            });
        });
    });

    // Update category with ID
    app.post('/admin/category/update/:id', isLoggedIn, upload.single('image'), function (req, res) {
        var category = req.body.category;
        // Check if posting new picture
        if (req.file) {
            // Check if posting new picture
            fs.access(pictPath, fs.F_OK, function (err) {
                if (!err) {
                    // Delete old picture
                    fs.unlink(pictureOldPath);
                } else {
                    // It isn't accessible
                }
            });

            // Save filename of new picture
            category.picture = req.file.filename;
        }

        Category.findByIdAndUpdate(mongoose.Types.ObjectId(req.params.id), {
            $set: category
        }, {
            new: true // return new model
        }, function (err, category) {
            if (err) throw err;
            res.render('category/create', {
                category: category
            });
        });
    });

    app.get('/admin/category/delete/:id', isLoggedIn, function (req, res) {

        Category.findOne({
            _id: mongoose.Types.ObjectId(req.params.id)
        }, function (err, category) {
            if (err) throw err;
            category.remove(function (err) {
                if (err) throw err;

                res.redirect('/admin/category/index');
            });
        });
    });

    app.post('/admin/category/search', function (req, res) {
        Category.find({
                name: {
                    $regex: req.body.searchString,
                    $options: 'i'
                }
            })
            .limit(parseInt(req.body.limit))
            .exec(function (err, docs) {
                if (err) throw err;
                res.send(docs);
            });
    });

}

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
};
