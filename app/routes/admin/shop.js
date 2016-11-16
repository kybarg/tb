var handlebarsPaginate = require('handlebars-paginate');
var mongoose = require('mongoose');
var multer = require('multer');
var Shop = require('../../models/shop');
var pathConfig = require('../../config/path.js');
var pictPath = pathConfig.shopPictPath;
var pictUrl = pathConfig.shopPictUrl;
var storage = require('../../lib/pictStorage.js')(pictPath);
var errorLogger = require('log4js').getLogger('error_log');
var dbLogger = require('log4js').getLogger('db_log');

var upload = multer({
    storage: storage
});

module.exports = function (app, passport, exphbs) {

    app.get('/admin/shop/index', isLoggedIn, function (req, res) {
        req.breadcrumbs(__('Shops'));
        // Using paginate for simplier pagination
        Shop.paginate({}, {
            page: req.query.page ? req.query.page : 1,
            sort: '_id',
            limit: 50
        }, function (err, result) {
            if (!err) {
                res.render('shop/index', {
                    breadcrumbs: req.breadcrumbs(),
                    shops: result.docs,
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

    app.get('/admin/shop/create', isLoggedIn, function (req, res) {
        req.breadcrumbs([{
            name: __('Shops'),
            url: '/admin/shop/index'
        }, {
            name: __('New shop')
        }]);

        res.render('shop/create', {
            breadcrumbs: req.breadcrumbs()
        });
    });

    app.post('/admin/shop/create', isLoggedIn, upload.single('image'), function (req, res) {
        var shop = new Shop(req.body.shop);
        if (req.file) {
            shop.pictureFile = req.file;
        }

        shop.save(function (err, shop) {
            if (err) {
                var errors = {
                    [err.errors.name.path + 'HasError']: true
                }
                res.render('shop/create', {
                    breadcrumbs: req.breadcrumbs(),
                    shop: req.body.shop,
                    errors: errors
                });
            } else {
                dbLogger.info('Shop added, id = ' + shop._id);
                res.redirect('/admin/shop/update/' + shop._id);
            }

        });
    });

    app.get('/admin/shop/update/:id', isLoggedIn, function (req, res) {
        Shop.findOne({
                _id: mongoose.Types.ObjectId(req.params.id)
            })
            .exec(function (err, shop) {
                req.breadcrumbs([{
                    name: __('Shops'),
                    url: '/admin/shop/index'
                }, {
                    name: shop.name
                }]);

                res.render('shop/create', {
                    breadcrumbs: req.breadcrumbs(),
                    shop: shop
                });
            });
    });

    // Update shop with ID
    app.post('/admin/shop/update/:id', isLoggedIn, upload.single('image'), function (req, res) {
        Shop.findById(req.params.id, function (err, shop) {
            if (err) {
                res.redirect('/admin/shop/update/' + req.params.id);
                return errorLogger.error(err.message);
            }

            // Update shop object with new values
            if (req.file) {
                shop.pictureFile = req.file;
            }
            shop = Object.assign(shop, req.body.shop);

            shop.save(function (err) {
                if (err) {
                    var errors = {
                        [err.errors.name.path + 'HasError']: true
                    }
                    res.render('shop/update/' + req.params.id, {
                        breadcrumbs: req.breadcrumbs(),
                        shop: req.body.shop,
                        errors: errors
                    });
                } else {
                    dbLogger.info('Shop updated, id = ' + shop._id);
                    res.redirect('/admin/shop/update/' + req.params.id);
                }
                
            });
        });
    });

    app.get('/admin/shop/delete/:id', isLoggedIn, function (req, res) {
        Shop.findById(req.params.id).exec(function (err, shop) {
            if (shop) {
                shop.remove();
                dbLogger.info('Shop removed, id = ' + shop._id);
            }
            res.redirect('/admin/shop/index');
        });
    });

    app.post('/admin/shop/search', isLoggedIn, function (req, res) {
        Shop.find({
                name: {
                    $regex: req.body.searchString ? req.body.searchString : '',
                    $options: 'i'
                }
            })
            .limit(parseInt(req.body.limit))
            .exec(function (err, docs) {
                if (err) errorLogger.error(err.message);
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