var fs = require('fs');
var nconf = require('nconf');
var multer = require('multer');
var upload = multer();
var adminConfig = require('../../config/admin_config.js');

module.exports = function (app, passport, exphbs) {
    app.get('/admin/settings/index', function (req, res) {
        req.breadcrumbs(__('Settings'));

        res.render('settings/index', {
            breadcrumbs: req.breadcrumbs(),
            settings: {
                admin: adminConfig.get('admin'),
                public: adminConfig.get('public'),
                global: adminConfig.get('global')}
                });
    });

    app.post('/admin/settings/index', upload.array(), function (req, res) {
        var admin = JSON.stringify(req.body.settings.admin)
        var public = JSON.stringify(req.body.settings.public);
        var global = JSON.stringify(req.body.settings.global);
        
        adminConfig.stores.admin.set('admin', req.body.settings.admin);
        adminConfig.stores.public.set('public', req.body.settings.public);
        adminConfig.stores.global.set('global', req.body.settings.global);
        adminConfig.save();
        adminConfig.stores.memory.set('admin', adminConfig.get('admin'));
        res.redirect('/admin/settings/index');
    });
}