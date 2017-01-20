var mongoose = require('mongoose');
var fs = require('fs');
var async = require('async');
var XmlStream = require('xml-stream');
var FeedImport = require('../../import/feed_import');
var ruleList = require('../../import/import_rules');
var feedList = new Map();

var feed = new FeedImport('http://export.admitad.com/ru/webmaster/websites/307243/products/export_adv_products/?feed_id=4102&code=43ade2cde4&last_import=&user=jacks&format=xml&limit=100');  
    feed.xmlStream = new XmlStream(fs.createReadStream('123.xml'));
 //   feed.startImport();

module.exports = function (app, passport, exphbs) {
    app.get('/admin/import/index', isLoggedIn, function (req, res){

    })

    app.get('/admin/import/start', isLoggedIn, function (req, res) {
    var feed = new FeedImport('http://export.admitad.com/ru/webmaster/websites/307243/products/export_adv_products/?feed_id=4102&code=43ade2cde4&last_import=&user=jacks&format=xml&limit=100');  
    feed.xmlStream = new XmlStream(fs.createReadStream('123.xml'));
    
    //feed.downloadFeed(function(){
   //     feed.startImport();
    //})

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
