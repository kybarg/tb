// set up ======================================================================
// get all the tools we need

/* TODO
/* Need to remove unnecessary extensions
/* Need to define globals
/* Need to think on better structure
*/

var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
// var logger = require('express-logger');
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var session = require('express-session')
var exphbs = require('express-handlebars');
var path = require('path');
var static = require('express-static');
var i18n = require('i18n');
// var i18nHelper = require('handlebars-helper-i18n');
// var multer = require('multer');
// var upload = multer();
var log4js = require('log4js');



var configDB = require('./config/database.js');

// configuration ===============================================================
log4js.configure('./config/logger.json');
mongoose.Promise = global.Promise;
mongoose.connect(configDB.url); // connect to our database


// Set up localization
i18n.configure({
    locales:['en', 'ru'],
    cookie: 'locale',
    defaultLocale: 'en',
    directory: __dirname + '/locales',
    register: global
});

require('./config/passport')(passport); // pass passport for configuration

// Set up our express application
// app.use(logger({
//     path: "./logfile.log"
// })); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)

// i18n init parses req for language headers, cookies, etc.
app.use(i18n.init);


// Parcing request data as json
app.use(bodyParser.urlencoded({
    extended: true
})); // get information from html forms
app.use(bodyParser.json());

// Define default template engine
app.set('view engine', '.hbs');

// required for passport
app.use(session({
    secret: 'Akn0gRw0395l6q4NU7rO2bbyw2xER444', // session secret
    cookie: {
        maxAge: 2628000000
    },
    store: new(require('express-sessions'))({
        storage: 'mongodb',
        instance: mongoose, // optional
        host: 'localhost', // optional
        port: 27017, // optional
        db: 'tb', // optional
        collection: 'sessions', // optional
        expire: 86400 // optional
    }),
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


// our custom "verbose errors" setting
// which we can use in the templates
// via settings['verbose errors']
app.enable('verbose errors');

// disable them in production
// use $ NODE_ENV=production node examples/error-pages
if ('production' == app.settings.env) app.disable('verbose errors');

// routes ======================================================================
require('./routes/routes.js')(app, passport, exphbs); // load our routes and pass in our app and fully configured passport
require('./routes/admin.js')(app, passport, exphbs);
require('./routes/admin/product.js')(app, passport, exphbs);
require('./routes/admin/category.js')(app, passport, exphbs);
require('./routes/admin/vendor.js')(app, passport, exphbs);
require('./routes/admin/settings.js')(app, passport, exphbs);
require('./routes/admin/shop.js')(app, passport, exphbs);
require('./routes/admin/import.js')(app, passport, exphbs);

// Defines folders with static files
app.use('/public', express.static('public')); 

// error pages
require('./routes/errors.js')(app, passport, exphbs);

// launch ======================================================================
app.listen(port);
console.log('Connected on port ' + port);
