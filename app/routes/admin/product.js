var handlebarsPaginate = require('handlebars-paginate');
var mongoose = require('mongoose');
var multer = require('multer');
var Product = require('../../models/product');
var pathConfig = require('../../config/path.js');
var pictPath = pathConfig.productPictPath;
var pictUrl = pathConfig.productPictUrl;
var pictStorage = require('../../lib/pictStorage.js');
var storage = pictStorage(pictPath);

var upload = multer({
    storage: storage
});

module.exports = function (app, passport, exphbs) {
    app.get('/admin/product/index', isLoggedIn, function (req, res) {

        req.breadcrumbs(__('Products'));
        Product.paginate({}, {
            page: req.query.page ? req.query.page : 1,
            sort: '-_id',
            limit: 50
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
                throw err;
            }
        });
    });

    app.post('/admin/product/delete', isLoggedIn, function (req, res) {
        var products = req.body.products;
        var productsIds = [];
        if (!products) {
            res.redirect('/admin/product/index');
        }

        // Removes all products with IDs
        Product.find({
            _id: {
                $in: productsIds
            }
        }, function (err, products) {
            if (err) throw err;
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
            if (err) throw err;
            console.log('Product added, id = ' + product._id);
            res.redirect('/admin/product/update/' + product._id);
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
                // product.getVend(function(err, val){
                //     console.log(val);
                // });

                // console.log(product.vend);
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
        var product = req.body.product;
        if (req.file) {
            product.pictureFile = req.file;
        }

        // Get product by ID and update with new data
        Product.findByIdAndUpdate(req.params.id, {
            $set: product
        }, {
            new: true // return new model
        }, function (err, product) {
            if (err) throw err;
            res.redirect('/admin/product/update/' + product._id);
        });
    });

    // Remove product with ID
    app.get('/admin/product/delete/:id', isLoggedIn, function (req, res) {

        // Need to read prodcut to be able to delete picture in the future
        Product.findOne({
            _id: req.params.id
        }, function (err, product) {
            if (err) throw err;

            product.remove(function (err) {
                if (err) throw err;

                // Redirect to all products list
                res.redirect('/admin/product/index');
            });

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