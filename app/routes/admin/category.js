var handlebarsPaginate = require('handlebars-paginate');
var mongoose = require('mongoose');
var multer = require('multer');
var Category = require('../../models/category');
var pictPath = require('../../config/path.js').categoryPictPath;
var pictUrl = require('../../config/path.js').categoryPictUrl;
var storage = require('../../lib/pictStorage.js')(pictPath);
var settingsMem = require('../../config/admin_config.js').stores.memory;
var errorLogger = require('log4js').getLogger('error_log');
var dbLogger = require('log4js').getLogger('db_log');
var route = require('../../models/route');

var upload = multer({
    storage: storage
});

module.exports = function (app, passport, exphbs) {

    app.get('/admin/category/index', isLoggedIn, function (req, res) {
        req.breadcrumbs(__('Categories'));

        Category.paginate({}, {
            page: req.query.page ? req.query.page : 1,
            sort: 'ancestors.0.name ancestors.1.name ancestors.2.name ancestors.3.name ancestors.4.name',
            // Maybe there less ugly way to solve sorting
            limit: parseInt(settingsMem.get('admin.category.perPage')),
            lean: 1
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
                errorLogger.error(err.message);
            }
        });

    });

    app.post('/admin/category/delete', isLoggedIn, function (req, res) {
        var categoriesIds = req.body.categories;
        if (!categoriesIds) {
            res.redirect('/admin/category/index');
        }

        // Removes all categories with IDs
        Category.find({
            _id: {
                $in: categoriesIds
            }
        }, function (err, categories) {
            if (err) {
                res.redirect('/admin/category/index');
                return errorLogger.error(err.message);
            }
            categories.forEach(function (category) {
                category.remove();
            });
            res.redirect('/admin/category/index');
        });
    });

    app.get('/admin/category/create', isLoggedIn, function (req, res) {
        req.breadcrumbs([{
            name: __('Categories'),
            url: '/admin/category/index'
        }, {
            name: __('New category')
        }]);

        res.render('category/create', {
            breadcrumbs: req.breadcrumbs()
        });
    });

    app.post('/admin/category/create', isLoggedIn, upload.single('image'), function (req, res) {
        req.breadcrumbs([{
            name: __('Categories'),
            url: '/admin/category/index'
        }, {
            name: __('New category')
        }]);

        var category = new Category(req.body.category);
        if (req.file) {
            category.pictureFile = req.file;
        }

        // route.generate();

        category.save(function (err, category) {
            if (err) {
                var errors = {
                    [err.errors.name.path + 'HasError']: true
                }

                res.render('category/create', {
                    breadcrumbs: req.breadcrumbs(),
                    category: req.body.category,
                    errors: errors
                });

            } else {
                dbLogger.info('Category added, id = ' + category._id);
                res.redirect('/admin/category/update/' + category._id);
            }
        });
    });

    app.get('/admin/category/update/:id', isLoggedIn, function (req, res) {
        Category.findById(req.params.id)
            // .populate('ancestors')
            .populate('parent')
            .exec(function (err, category) {
                req.breadcrumbs([{
                    name: __('Categories'),
                    url: '/admin/category/index'
                }, {
                    name: category.name
                }]);

                res.render('category/create', {
                    breadcrumbs: req.breadcrumbs(),
                    category: category,
                    pictUrl: pictUrl
                });
            });
    });

    // Update category with ID
    app.post('/admin/category/update/:id', isLoggedIn, upload.single('image'), function (req, res) {
        Category.findById(req.params.id, function (err, category) {
            if (err) {
                res.redirect('/admin/category/update/' + req.params.id);
                return errorLogger.error(err.message);
            }

            // Update category object with new values
            if (req.file) {
                category.pictureFile = req.file;
            }

            category = Object.assign(category, req.body.category);

            category.save(function (err) {
                if (err) {
                    var errors = {
                        [err.errors.name.path + 'HasError']: true
                    }
                    res.render('category/update/' + req.params.id, {
                        breadcrumbs: req.breadcrumbs(),
                        category: req.body.category,
                        errors: errors
                    });
                } else
                    res.redirect('/admin/category/update/' + req.params.id);
            });
        });

    });

    app.get('/admin/category/delete/:id', isLoggedIn, function (req, res) {
        Category.findById(req.params.id).exec(function (err, category) {
            if (category) {
                category.remove();
                dbLogger.info('category removed, id = ' + category._id);
            }
            res.redirect('/admin/category/index');
        })
    });

    app.post('/admin/category/search', function (req, res) {
        Category.find({
                name: {
                    $regex: req.body.searchString ? req.body.searchString : '',
                    $options: 'i'
                }
            })
            .populate('ancestors')
            .populate('parent')
            .limit(parseInt(req.body.limit))
            .exec(function (err, docs) {
                if (err) errorLogger.error(err.message);
                res.send(docs);
            });
    });

}

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry onf
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}