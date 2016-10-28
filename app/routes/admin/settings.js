var fs = require('fs');
var nconf = require('nconf');
var multer = require('multer');
var upload = multer();

nconf.env().argv();
nconf.use('file', {
    file: './config/setting.json'
})

module.exports = function (app, passport, exphbs) {
    app.get('/admin/settings/index', isLoggedIn, function (req, res) {
        req.breadcrumbs(__('Settings'));

        res.render('settings/index', {
            breadcrumbs: req.breadcrumbs(),
            settings: {
                admin: JSON.parse(fs.readFileSync('./config/admin_settings.json')),
                public: JSON.parse(fs.readFileSync('./config/public_settings.json')),
                global: JSON.parse(fs.readFileSync('./config/global_settings.json'))
            }
        });


    });

    app.post('/admin/settings/index', isLoggedIn, upload.array(), function (req, res) {
        var admin = JSON.stringify(req.body.settings.admin);
        var public = JSON.stringify(req.body.settings.public);
        var global = JSON.stringify(req.body.settings.global);
        fs.writeFile('./config/admin_settings.json', admin);
        fs.writeFile('./config/public_settings.json', public);
        fs.writeFile('./config/global_settings.json', global);

        res.redirect('/admin/settings/index');
    });
}


function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
};