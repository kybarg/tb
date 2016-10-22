
 var fs    = require('fs'),
      nconf = require('nconf');

var multer = require('multer');
var upload = multer();




nconf.env().argv();

nconf.use('file', { file: './config/setting.json' })


nconf.set('product:limit', 50);
nconf.set('vendor:limit', 50);

 nconf.save();
  
module.exports = function(app, passport, exphbs) {
    app.get('/admin/settings/index', isLoggedIn, function(req, res) {
        req.breadcrumbs('Settings');
        res.render('settings/index', {
            breadcrumbs: req.breadcrumbs(),
        });
    });

    app.post('/admin/settings/index', isLoggedIn, upload.array(), function(req, res) {
     //   console.log(req.body);
        var s = JSON.stringify(req.body.settings, null);
        
        fs.writeFile('./config/setting.json', s);
       // nconf.set(s);  
       // nconf.save();
       console.log(nconf.get('admin'))
        });
    

}


function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
};    