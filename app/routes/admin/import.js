var mongoose = require('mongoose');

module.exports = function (app, passport, exphbs) {
    app.get('/admin/import/index', isLoggedIn, function (req, res){

    })

}




function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}