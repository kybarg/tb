var mongoose = require('mongoose');
var fs = require('fs');
var async = require('async');
var XmlStream = require('xml-stream');
var FeedImport = require('../../import/feed_import');
var ruleList = require('../../import/import_rules');
var feedList = new Map();


module.exports = function (app, passport, exphbs) {
    app.get('/admin/import/index', isLoggedIn, function (req, res){

    })

    app.get('/admin/import/start', isLoggedIn, function (req, res) {
      
 


    })

    app.get('/admin/import/rules', isLoggedIn, function (req, res) {
        
        

    })
    
    app.post('/admin/import/rules/add', isLoggedIn, function (req, res) {
        
     
    })

    app.post('/admin/import/rules/remove', isLoggedIn, function (req, res) {
        
       //not yet 
       
    })
}




function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}