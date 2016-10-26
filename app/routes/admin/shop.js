var handlebarsPaginate = require('handlebars-paginate');
var mongoose = require('mongoose');
var multer = require('multer');
var Shop = require('../../models/shop');
var pathConfig = require('../../config/path.js');
var pictPath = pathConfig.shopPictPath;
var pictUrl = pathConfig.shopPictUrl;
var storage = require('../../lib/pictStorage.js')(pictPath);

var upload = multer({
    storage: storage
});

module.exports = function (app, passport, exphbs) {
    
    app.get('/admin/shop/index', isLoggedIn, function (req, res) {

        req.breadcrumbs('Shops');

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
                throw err;
            }
        });
    });

    app.get('/admin/shop/create', isLoggedIn, function (req, res) {
        req.breadcrumbs([{
            name: 'Shops',
            url: '/admin/shop/index'
        }, {
            name: 'New shop'
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
            if (err) throw err;
            console.log('Shop added, id = ' + shop._id);
            res.redirect('/admin/shop/update/' + shop._id);
        });
    });

    app.get('/admin/shop/update/:id', isLoggedIn, function (req, res) {
        Shop.findOne({
                _id: mongoose.Types.ObjectId(req.params.id)
            })
            .exec(function (err, shop) {
                req.breadcrumbs([{
                    name: 'Shops',
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
        var shop = req.body.shop;
        if (req.file) {
            shop.pictureFile = req.file;
        }

        Shop.findByIdAndUpdate(req.params.id, {
            $set: shop
        }, {
            new: true // return new model
        }, function (err, shop) {
            if (err) throw err;
            res.redirect('/admin/shop/update/' + shop._id);
        });
    });

    app.get('/admin/shop/delete/:id', isLoggedIn, function (req, res) {
        Shop.findOne({
            _id: mongoose.Types.ObjectId(req.params.id)
        }, function (err, shop) {
            if (err) throw err;
            shop.remove(function (err) {
                if (err) throw err;
                res.redirect('/admin/shop/index');
            });
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