var handlebarsPaginate = require('handlebars-paginate');
var mongoose = require('mongoose');
var multer = require('multer');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var pathConfig = require('../../config/path.js');
var pictPath = pathConfig.productPictPath;
var pictUrl = pathConfig.productPictUrl;
var upload = multer()


module.exports = function(app, passport, exphbs) {

    app.get('/admin/settings/index', isLoggedIn, function(req, res) {

        req.breadcrumbs('Settings');

        res.render('settings/index', {
            breadcrumbs: req.breadcrumbs(),
        });
    });

    app.post('/admin/settings/index', isLoggedIn, upload.array(), function(req, res) {
        console.log(req.body);
    });

}






function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
};
