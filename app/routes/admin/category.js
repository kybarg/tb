var handlebarsPaginate = require('handlebars-paginate');
var mongoose = require('mongoose');
var multer = require('multer');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var Category = require('../../models/category');
var pictPath = require('../../config/path.js').categoryPictPath;
var math = require('mathjs');

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, pictPath)
    },
    filename: function(req, file, cb) {
        crypto.pseudoRandomBytes(16, function(err, raw) {
            if (err) return cb(err)
            cb(null, raw.toString('hex') + Date.now().toString() + path.extname(file.originalname))
        })
    }
});

var upload = multer({
    storage: storage
});

module.exports = function(app, passport, exphbs) {

    app.get('/admin/category/index', isLoggedIn, function(req, res) {

        req.breadcrumbs('Categories');

        Category.find()
            .select({
                ancestors: 1,
                name: 1,
                parent: 1
            })
            .sort('name')
            .lean()
            .exec(function(err, categories) {
                if (err) throw err;

                categories = treeify(categories, '_id', 'parent', 'children')

                var page = parseInt(req.query.page ? req.query.page : 1);
                var limit = parseInt(50);

                var result = [];
                bfs({
                    "children": categories
                }, 'children', result);

                var pages = Math.ceil(result.length / limit);

                var start = ((page - 1) * limit);
                result = result.slice(start, (start + limit));

                res.render('category/index', {
                    breadcrumbs: req.breadcrumbs(),
                    categories: result,
                    pagination: {
                        page: page,
                        pageCount: pages
                    },
                    showPagination: (pages > 1) ? true : false,
                    helpers: {
                        paginate: handlebarsPaginate
                    }
                });

            });
    });

    app.get('/admin/category/create', isLoggedIn, function(req, res) {
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

    app.post('/admin/category/create', isLoggedIn, upload.single('image'), function(req, res) {
        req.breadcrumbs([{
            name: 'Categories',
            url: '/admin/category/index'
        }, {
            name: 'New category'
        }]);

        var category = new Category(req.body.category);
        if (req.file) {
            category.picture = req.file.filename; // Store uploaded picture filename
        }

        category.save(function(err, category) {
            if (err) {
                // var c = new Category(req.body.category)

                // res.send(JSON.stringify(err, null, " "));

                var errors = {
                    [err.errors.name.path + 'HasError']: true
                }

                res.render('category/create', {
                    breadcrumbs: req.breadcrumbs(),
                    category: req.body.category,
                    errors: errors
                });

            } else
                res.redirect('/admin/category/update/' + category._id);
        });
    });

    app.get('/admin/category/update/:id', isLoggedIn, function(req, res) {
        Category.findById(req.params.id)
            // .populate('ancestors')
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
    app.post('/admin/category/update/:id', isLoggedIn, upload.single('image'), function(req, res) {
        // Check if posting new picture
        if (req.file) {
            // Check if posting new picture
            fs.access(pictPath, fs.F_OK, function(err) {
                if (!err) {
                    // Delete old picture
                    fs.unlink(pictureOldPath);
                } else {
                    // It isn't accessible
                }
            });

            // Save filename of new picture
            req.body.category.picture = req.file.filename;
        }

        Category.findById(req.params.id, function(err, category) {
            if (err) throw err;

            // Update category object with new values
            category = Object.assign(category, req.body.category);

            category.save(function(err) {
                if (err) throw err;
                res.redirect('/admin/category/update/' + req.params.id);
            });
        });

    });

    app.get('/admin/category/delete/:id', isLoggedIn, function(req, res) {

        Category.findOne({
            _id: mongoose.Types.ObjectId(req.params.id)
        }, function(err, category) {
            if (err) throw err;
            category.remove(function(err) {
                if (err) throw err;

                res.redirect('/admin/category/index');
            });
        });
    });

    app.post('/admin/category/search', function(req, res) {
        Category.find({
                name: {
                    $regex: req.body.searchString ? req.body.searchString : '',
                    $options: 'i'
                }
            })
            .populate('ancestors')
            .populate('parent')
            .limit(parseInt(req.body.limit))
            .exec(function(err, docs) {
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

function treeify(list, idAttr, parentAttr, childrenAttr) {
    if (!idAttr) idAttr = 'id';
    if (!parentAttr) parentAttr = 'parent';
    if (!childrenAttr) childrenAttr = 'children';
    var treeList = [];
    var lookup = {};

    var tmpList = [];

    list.forEach(function(obj) {
        lookup[obj[idAttr]] = obj;
        obj[childrenAttr] = [];
    });

    list.forEach(function(obj) {
        if (typeof obj[parentAttr] !== 'undefined' && obj[parentAttr] != null) {
            lookup[obj[parentAttr]][childrenAttr].push(obj);
        } else {
            treeList.push(obj);
        }
    });
    return treeList;
};

function bfs(tree, key, collection) {
    if (!tree[key] || tree[key].length === 0) return;
    for (var i = 0; i < tree[key].length; i++) {
        var child = tree[key][i]
        collection.push(child);
        bfs(child, key, collection);
    }
    return;
}
