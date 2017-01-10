var mongoose = require('mongoose');
var fs = require('fs');
var async = require('async');
var XmlStream = require('xml-stream');
var FeedImport = require('../../import/feed_import');
var ruleList = require('../../import/import_rules');
var feedList = new Map();


module.exports = function (app, passport, exphbs) {
    app.get('/admin/import/index', function (req, res) {

    })

    app.get('/admin/import/start', function (req, res) {



    })

    app.get('/admin/import/rules', function (req, res) {



    })

    app.post('/admin/import/rules/add', function (req, res) {


    })

    app.post('/admin/import/rules/remove', function (req, res) {

        //not yet 

    })
}