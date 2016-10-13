// set up ======================================================================
// get all the tools we need
var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var logger = require('express-logger');
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var session = require('express-session')
var exphbs = require('express-handlebars');
var path = require('path');
var static = require('express-static');
var multer = require('multer');
var upload = multer();

var configDB = require('./config/database.js');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(logger({
    path: "./logfile.log"
})); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)

app.use(bodyParser.urlencoded({
    extended: true
})); // get information from html forms
app.use(bodyParser.json());
app.use(upload.array());

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

// routes ======================================================================
require('./routes/routes.js')(app, passport, exphbs); // load our routes and pass in our app and fully configured passport
require('./routes/admin.js')(app, passport, exphbs);

app.use('/admin', express.static('admin'));

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
