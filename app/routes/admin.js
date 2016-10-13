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
    app.get('/admin/products', isLoggedIn, function(req, res) {
        res.render('products');
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
