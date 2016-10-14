var handlebarsPaginate = require('handlebars-paginate');
var mongoose = require('mongoose');
var multer = require('multer');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

// Define storage methods for picture upload
// We define naming function and destination folder
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, __dirname + '/../public/uploads/')
    },
    filename: function(req, file, cb) {
        crypto.pseudoRandomBytes(16, function(err, raw) {
            if (err) return cb(err)

            cb(null, raw.toString('hex') + path.extname(file.originalname))
        })
    }
})

// Multer upload handler
var upload = multer({
    storage: storage
});

module.exports = function(app, passport, exphbs) {

    // Defines rules for all /admin* requests
    app.all('/admin*', function(req, res, next) {
        // Changing views folder
        app.set('views', 'admin/views');

        // Defines layouts folder and main layut for /admin
        app.engine('.hbs', exphbs({
            defaultLayout: 'main',
            extname: '.hbs',
            layoutsDir: 'admin/views/layouts/'
        }));
        next(); // pass control to the next handler
    });

    // =====================================
    // ADMIN HOME PAGE (with login links) ==
    // =====================================
    app.get('/admin', isLoggedIn, function(req, res) {
        res.render('index'); // load the index.hbs file
    });

    // =====================================
    // PRODUCTS ============================
    // =====================================

    var Product = require('../models/product');

    app.get('/admin/products', isLoggedIn, function(req, res) {

        // Using paginate for simplier pagination
        Product.paginate({}, {
            page: req.query.page ? req.query.page : 1,
            limit: 50
        }, function(err, result) {
            // result.docs
            // result.total
            // result.limit - 10
            // result.page - 3
            // result.pages
            result.page = parseInt(result.page);

            if (!err) {
                res.render('products', {
                    products: result.docs,
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

    // Remove products with IDs
    app.post('/admin/products/delete', isLoggedIn, function(req, res) {
        var products = req.body.products;
        var productsIds = [];

        if (!products) {
            res.redirect('/admin/products');
        }

        // Converting all IDs from String to ObjectID
        for (var i = 0; i < products.length; i++) {
            productsIds.push(mongoose.Types.ObjectId(products[i]));
        }

        // Removes all products with IDs
        Product.find({
            _id: {
                $in: productsIds
            }
        }, function(err, products) {
            if (err) throw err;
            products.forEach(function(product) {
                product.remove();
            });
            res.redirect('/admin/products');
        });
    })


    // View from for addign new product
    app.get('/admin/products/add', isLoggedIn, function(req, res) {
        res.render('products/add');
    });


    /* TODO
    /* File upload handler should be moved to model as we need use it in import too.
    /* Looks like this can solve issue https://www.npmjs.com/package/mongoose-file
    */

    // Save new product
    app.post('/admin/products/add', isLoggedIn, upload.single('image'), function(req, res) {

        var product = req.body.product;

        // Check if posting new picture
        if (req.file)
            product.picture = req.file.name; // Store uploaded picture filename

        /* TODO
        /* Now it works syncronyosly as we dont save model till file is'n uploaded
        */

        product = new Product(product);
        product.save(function(err, product) {
            if (err) throw err;
            console.log('Product added, id = ' + product._id);
            console.log(product.name);
            res.redirect('/admin/products/' + product._id);
        });
    });

    // Display product with ID
    app.get('/admin/products/:id', isLoggedIn, function(req, res) {
        Product.findOne({
            _id: mongoose.Types.ObjectId(req.params.id)
        }, function(err, product) {
            res.render('products/add', {
                product: product
            });
        });
    })

    // Update product with ID
    app.post('/admin/products/:id', isLoggedIn, upload.single('image'), function(req, res) {

        var product = req.body.product;

        // Check if posting new picture
        if (req.file) {
            var pictureOldPath = __dirname + '/../public/uploads/' + product.picture;

            // Check if posting new picture
            fs.access(pictureOldPath, fs.F_OK, function(err) {
                if (!err) {
                    // Delete old picture
                    fs.unlink(pictureOldPath);
                } else {
                    // It isn't accessible
                }
            });

            // Save filename of new picture
            product.picture = req.file.filename;
        }

        // Get product by ID and update with new data
        Product.findByIdAndUpdate(mongoose.Types.ObjectId(req.params.id), {
            $set: product
        }, {
            new: true // return new model
        }, function(err, product) {
            if (err) throw err;
            res.render('products/add', {
                product: product
            });
        });
    });

    // Remove product with ID
    app.get('/admin/products/:id/delete', isLoggedIn, function(req, res) {

        // Need to read prodcut to be able to delete picture in the future
        Product.findOne({
            _id: mongoose.Types.ObjectId(req.params.id)
        }, function(err, product) {
            if (err) throw err;

            product.remove(function(err) {
                if (err) throw err;

                // Redirect to all products list
                res.redirect('/admin/products');
            });

        });


    })
}

// route middleware to make sure
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
