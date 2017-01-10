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

    app.get('/admin/category/index', function (req, res, next) {
        req.breadcrumbs(__('Categories'));

        Category.paginate({}, {
            limit: parseInt(settingsMem.get('admin.category.perPage')),
            lean: 1,
            page: req.query.page ? req.query.page : 1,
            // Maybe there less ugly way to solve sorting
            sort: 'ancestors.0.name ancestors.1.name ancestors.2.name ancestors.3.name ancestors.4.name'
        }, function (err, result) {
            if (err) return next(err);

            res.render('category/index', {
                breadcrumbs: req.breadcrumbs(),
                categories: result.docs,
                helpers: {
                    paginate: handlebarsPaginate
                },
                pagination: {
                    page: result.page,
                    pageCount: result.pages
                },
                showPagination: result.pages > 1 ? true : false
            });
        });

    });

    app.post('/admin/category/delete', function (req, res) {
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

    app.get('/admin/category/create', function (req, res) {
        req.breadcrumbs([{
            name: __('Categories'),
            url: '/admin/category/index'
        }, {
            name: __('New category')
        }]);

        res.render('category/form', {
            breadcrumbs: req.breadcrumbs()
        });
    });

    app.post('/admin/category/create', upload.single('image'), function (req, res, next) {
        req.breadcrumbs([{
            name: __('Categories'),
            url: '/admin/category/index'
        }, {
            name: __('New category')
        }]);

        var categoryNew = new Category(req.body.category);
        if (req.file) {
            categoryNew.pictureFile = req.file;
        }

        // route.generate();

        categoryNew.save(function (err, category) {
            if (err && err.name != 'ValidationError') return next(err);
            if (err) {

                res.render('category/form', {
                    breadcrumbs: req.breadcrumbs(),
                    category: categoryNew,
                    errors: err.errors
                });

            } else {
                dbLogger.info('Category added, id = ' + category._id);
                res.redirect('/admin/category/update/' + category._id);
            }
        });
    });

    app.get('/admin/category/update/:id', function (req, res, next) {
        Category.findById(req.params.id)
            // .populate('ancestors')
            .populate('parent')
            .exec(function (err, category) {

                if (err) return next(err);
                if (!category) return next();

                req.breadcrumbs([{
                    name: __('Categories'),
                    url: '/admin/category/index'
                }, {
                    name: category.name
                }]);

                res.render('category/form', {
                    breadcrumbs: req.breadcrumbs(),
                    category: category,
                    pictUrl: pictUrl
                });
            });
    });

    // Update category with ID
    app.post('/admin/category/update/:id', upload.single('image'), function (req, res, next) {
        Category.findById(req.params.id, function (err, category) {

            if (err) return next(err);
            if (!category) return next();

            // Update category object with new values
            if (req.file) {
                category.pictureFile = req.file;
            }

            category = Object.assign(category, req.body.category);

            category.save(function (err) {
                if (err && err.name != 'ValidationError') return next(err);
                if (err) {
                    // var errors = {
                    //     [err.errors.name.path + 'HasError']: true
                    // }
                    res.render('category/form', {
                        breadcrumbs: req.breadcrumbs(),
                        category: req.body.category,
                        errors: err.errors
                    });
                } else
                    res.redirect('/admin/category/update/' + req.params.id);
            });
        });

    });

    app.get('/admin/category/delete/:id', function (req, res) {
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