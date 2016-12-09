var mongoose = require('mongoose');
var fs = require('fs');
var async = require('async');
var XmlStream = require('xml-stream');
var xmlStream;


module.exports = function (app, passport, exphbs) {
    app.get('/admin/import/index', isLoggedIn, function (req, res) {

    })

    app.get('/admin/import/start', isLoggedIn, function (req, res) {
        //download file
        var stream = fs.createReadStream('wildberries-ru_products_20161106_002302.xml');
        xmlStream = new XmlStream(stream);
        // xmlStream.collect('param');
        // xmlStream.collect('picture');

        async.waterfall([
                function (callback) {
                    xmlStream.on('endElement: offer', function (item) {
                        xmlStream.pause();
                        callback(null, item);
                    });
                }
            ],
            function (err, callback) {
                console.log(callback);
                res.send('dsfgsdfg');
            });


    })

    app.get('/admin/import/resume', isLoggedIn, function (req, res) {
        //do something with req.body.item, write to rules etc
        xmlStream.resume();
        async.waterfall([
                function (callback) {
                    xmlStream.on('endElement: offer', function (item) {
                        xmlStream.pause();
                        callback(null, item);
                    });
                }
            ],
            function (err, callback) {
                console.log(callback);
                res.send('dsfgsdfg');
            });



    })
}




function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}