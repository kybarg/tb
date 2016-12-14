var mongoose = require('mongoose');
var fs = require('fs');
var async = require('async');
var XmlStream = require('xml-stream');
var FeedImport = require('../../import/feed_import');
var importRules = require('../../import/feed_import').Rules;
var feedList = new Map();


module.exports = function (app, passport, exphbs) {
    app.get('/admin/import/index', isLoggedIn, function (req, res){

    })

    app.get('/admin/import/start', isLoggedIn, function (req, res) {
        //var feed = new FeedImport(req.body.shop.feedUrl);
        var feed = new FeedImport('http://export.admitad.com/ru/webmaster/websites/307243/products/export_adv_products/?feed_id=4102&code=43ade2cde4&last_import=&user=jacks&format=xml&limit=100');
      //  feedList.set(req.body.shop.id, feed);
     //   importRules.addRule('product.param', {name: 'Цвет',prop:'color', value: 'Красный', match: ['темно-красный']})
      //   importRules.addRule('product.param:value:Красный','темно-темный');
          importRules.addRule('product.param:value:Красный','красн', true);
        feed.on('download', function(stream){
            feed.startImport();
        })

        feed.on('itemImportNeedUser', function(item){
            console.log('ilikeconsole');
        })

        feed.downloadFeed(null, function(){});


    })

    app.get('/admin/import/rules', isLoggedIn, function (req, res) {
        
        
        //res.send(feedList.product);
    })
    
    app.post('/admin/import/rules/add', isLoggedIn, function (req, res) {
        
        // importRules.addRule('product.name.whitelist', 'newRule');
        // importRules.addRule(req.body.path, req.body.rule);
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