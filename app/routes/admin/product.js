var handlebarsPaginate = require('handlebars-paginate');
var mongoose = require('mongoose');
var multer = require('multer');
var Product = require('../../models/product');
var pictPath = require('../../config/path.js').productPictPath;
var pictUrl = require('../../config/path.js').productPictUrl;
var storage = require('../../lib/pictStorage.js')(pictPath);
var settingsMem = require('../../config/admin_config.js').stores.memory;
var errorLogger = require('log4js').getLogger('error_log');
var dbLogger = require('log4js').getLogger('db_log');


var upload = multer({
    storage: storage
});

module.exports = function (app, passport, exphbs) {
    app.get('/admin/product/index', isLoggedIn, function (req, res) {    
        req.breadcrumbs(__('Products'));
        Product.paginate({}, {
            page: req.query.page ? req.query.page : 1,
            sort: '-_id',
            limit: parseInt(settingsMem.get('admin.product.perPage'))
        }, function (err, result) {
            if (!err) {
                res.render('product/index', {
                    breadcrumbs: req.breadcrumbs(),
                    products: result.docs,
                    pictUrl: pictUrl,
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

    app.post('/admin/product/delete', isLoggedIn, function (req, res) {
        var productsIds = req.body.products;
        if (!productsIds) {
            res.redirect('/admin/product/index');
        }

        // Removes all products with IDs
        Product.find({
            _id: {
                $in: productsIds
            }
        }, function (err, products) {
            if (err) {
                res.redirect('/admin/product/index');
                return errorLogger.error(err.message);
            }

            products.forEach(function (product) {
                product.remove();
            });
            res.redirect('/admin/product/index');
        });
    });

    // View from for addign new product
    app.get('/admin/product/create', isLoggedIn, function (req, res) {
        req.breadcrumbs([{
            name: __('Products'),
            url: '/admin/product/index'
        }, {
            name: __('New product')
        }]);

        res.render('product/create', {
            breadcrumbs: req.breadcrumbs()
        });
    });

    // Save new product
    app.post('/admin/product/create', isLoggedIn, upload.single('image'), function (req, res) {
        var product = new Product(req.body.product);
        if (req.file) {
            product.pictureFile = req.file;
        };
        product.save(function (err, product) {
            if (err) {
                var errors = {
                    [err.errors.name.path + 'HasError']: true
                }

                res.render('product/create', {
                    breadcrumbs: req.breadcrumbs(),
                    product: req.body.product,
                    errors: errors
                });
            } else {
                dbLogger.info('Product added, id = ' + product._id);
                res.redirect('/admin/product/update/' + product._id);
            }
        });
    });

    // Display product with ID
    app.get('/admin/product/update/:id', isLoggedIn, function (req, res) {
        Product.findOne({
                _id: req.params.id
            })
            .populate('category')
            .populate('vendor')
            .populate('shop')
            .exec(function (err, product) {
                req.breadcrumbs([{
                    name: __('Products'),
                    url: '/admin/product/index'
                }, {
                    name: product.name
                }]);
                res.render('product/create', {
                    breadcrumbs: req.breadcrumbs(),
                    product: product,
                    pictUrl: pictUrl
                });
            });
    })

    // Update product with ID
    app.post('/admin/product/update/:id', isLoggedIn, upload.single('image'), function (req, res) {
        // Get product by ID and update with new data
        Product.findById(req.params.id, function (err, product) {
            if (err) {
                res.redirect('/admin/product/update/' + req.params.id);
                return errorLogger.error(err.message);
            }

            // Update product object with new values
            if (req.file) {
                product.pictureFile = req.file;
            }
            product = Object.assign({}, product, req.body.product);

            product.save(function (err) {
                if (err) {
                    var errors = {
                        [err.errors.name.path + 'HasError']: true
                    }
                    res.render('product/update/' + req.params.id, {
                        breadcrumbs: req.breadcrumbs(),
                        product: req.body.product,
                        errors: errors
                    });
                } else {
                    res.redirect('/admin/product/update/' + req.params.id);
                }
            });
        });
    });

    // Remove product with ID
    app.get('/admin/product/delete/:id', isLoggedIn, function (req, res) {
        Product.findById(req.params.id).exec(function (err, product) {
            if (product) {
                product.remove();
                dbLogger.info('product removed, id = ' + product._id);
            }
            res.redirect('/admin/product/index');
        });
    });
}

// route middleware to make sure
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}