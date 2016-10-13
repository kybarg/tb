module.exports = function(app, passport, exphbs) {

    app.all('/admin*', function(req, res, next) {
        app.set('views', 'admin/views');
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
    app.get('/admin', isLoggedIn,function(req, res) {
        res.render('index'); // load the index.hbs file
    });

    // =====================================
    // PRODUCTS ============================
    // =====================================
    
    var Product = require('../models/product');
    
    app.get('/admin/products', isLoggedIn, function(req, res) {
        res.render('products');
    });

    app.get('/admin/products/add', isLoggedIn, function(req, res) {
        res.render('products/add');
    });

    app.post('/admin/products/add', function(req, res) {
        console.log(req.body.product);
        var product = new Product(req.body.product);
        product.save(function(err) {
                    if (err)
                       throw err;
                    console.log('Product added, id = ' + product._id);
                    res.render('products/add');
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
