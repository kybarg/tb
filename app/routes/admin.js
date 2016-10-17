var handlebarsPaginate = require('handlebars-paginate');
var breadcrumbs = require('express-breadcrumbs');
var mongoose = require('mongoose');
var fs = require('fs');
var path = require('path');

module.exports = function(app, passport, exphbs) {

    app.use(breadcrumbs.init());

    // Set Breadcrumbs home information
    app.use(breadcrumbs.setHome());

    // Mount the breadcrumbs at `/admin`
    app.use('/admin', breadcrumbs.setHome({
        name: 'Dashboard',
        url: '/admin'
    }));

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
}

// route middleware to make sure
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
