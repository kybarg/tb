var handlebarsPaginate = require('handlebars-paginate');
var breadcrumbs = require('express-breadcrumbs');
var mongoose = require('mongoose');
var fs = require('fs');
var path = require('path');
var express = require('express');
var settingsMem = require('../config/admin_config.js').stores.memory;

module.exports = function (app, passport, exphbs) {

    app.use(breadcrumbs.init());

    // Set Breadcrumbs home information
    // app.use(breadcrumbs.setHome());

    // Mount the breadcrumbs at `/admin`
    app.use('/admin', breadcrumbs.setHome({
        name: function () {
            return __('Dashboard');
        },
        url: '/admin'
    }));

    // Defines rules for all /admin* requests
    app.all('/admin*', function (req, res, next) {
        // Changing views folder
        app.set('views', 'admin/views');

        // Defines layouts folder and main layut for /admin
        app.engine('.hbs', exphbs({
            defaultLayout: 'main',
            extname: '.hbs',
            layoutsDir: 'admin/views/layouts/',
            partialsDir: 'admin/views/partials/'
        }));
        next(); // pass control to the next handler
    });

    // =====================================
    // ADMIN HOME PAGE (with login links) ==
    // =====================================


    app.get('/admin/login', function (req, res) {

        if (req.isAuthenticated()) {
            res.redirect('/admin')
        } else {
            // render the page and pass in any flash data if it exists
            res.render('login', {
                message: req.flash('loginMessage'),
                layout: 'other'
            });
        }
    });

    // process the login form
    app.post('/admin/login', passport.authenticate('local-login', {
        successRedirect: '/admin', // redirect to the secure profile section
        failureRedirect: '/admin/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // Set folder for statci files
    app.use('/admin', express.static('admin'));

    // Check if logged middleware for all /admin requests
    app.use('/admin*', function (req, res, next) {

        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
            return next();

        // if they aren't redirect them to the home page
        res.redirect('/admin/login');
    });

    // Assing global configs to all requests
    app.use(function (req, res, next) {
        res.locals.config = {
            global: settingsMem.get('global')
        };
        res.locals.ref_path = req.url;
        next();
    });

    app.get('/admin', function (req, res) {
        res.render('index'); // load the index.hbs file
    });

    // Chnage locale route
    app.get('/admin/setlocale/:locale', function (req, res) {
        res.cookie('locale', req.params.locale, {
            maxAge: 900000,
            httpOnly: true
        });
        res.redirect('back');
    });
}