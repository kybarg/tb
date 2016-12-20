var http = require('http');
var fs = require('fs');
var async = require('async');
var events = require('events');
var util = require('util');
var contentDisposition = require('content-disposition');
var XmlStream = require('xml-stream');
var ruleList = require('../import/import_rules');
var Product = require('../models/product');
var pictPath = require('./../config/path.js').productPictPath;
var storage = require('../lib/pictStorage.js')(pictPath);

function FeedImport(source) {
    if (typeof source === 'string') {
        this.source = {
            url: source,
            lastUpdate: 0
        }
    } else {
        this.source = source;
    }
    this.importStats = {
        new: 0,
        updated: 0,
        deleted: 0
    };
}

util.inherits(FeedImport, events.EventEmitter);

FeedImport.prototype.downloadFeed = function (err, callback) {
    console.log('downloading from ' + this.source.url);
    var self = this;
    try {
        var request = http.get(this.source.url, function (response) {
            if (response.statusCode === 200) {
                var fileName = contentDisposition.parse(response.headers['content-disposition']).parameters.filename;
                var file = fs.createWriteStream(fileName);
                file.on('finish', function () {
                    self.xmlStream = new XmlStream(fs.createReadStream(fileName));
                    self.emit('download', self.xmlStream);
                    console.log('download done');
                    callback();
                })
                file.on('error', function () {
                    self.emit('downloadError', filename);
                    fs.unlink(fileName);
                    console.log('failed to download ' + fileName);
                    callback();
                })
                response.pipe(file);
            } else {
                self.emit('httpError', response.statusMessage);
                console.log(response.statusCode + " " + response.statusMessage);
                callback();
            }
        })
    } catch (e) {
        err = e;
        console.log(e);
        callback();
    }
}

FeedImport.prototype.importItem = function (item) {
    this.xmlStream.pause();
    var self = this;
    var params = item.param;
    var picts = item.picture;
    var product = new Product();
    var rule;
    var value;
    product.name = item.name;
    for (var i = 0; i < params.length; i++) {
        rule = ruleList.getRule(params[i].$.name)
        if (rule) {
            value = ruleList.getValue(rule, params[i].$text);
            if (value) {
                if (Array.isArray(product[rule.prop])) {
                    product[rule.prop].push(value);
                } else {
                    product[rule.prop] = value;
                }
            }
        }
    }
    product.description = item.description;
    product.price = parseInt(item.price);
    product.oldPrice = item.oldprice !== undefined ? parseInt(item.oldprice) : null;
    product.url = item.url;
    product.shop = this.source.id !== undefined ? this.source : null;
    if (Array.isArray(picts)){
        var prod = product;
        async.eachSeries(picts, function(picture, done){
            storage.downloadFile(picture, function(err, file){
                if (!err){
                    product.addPicture(file);
                } else{
                    console.log(err.message)
                }
                done();
            })
        }, function(){
            product.save();
            self.xmlStream.resume();
        })
    }
}



FeedImport.prototype.startImport = function () {
    var self = this;
    this.xmlStream.collect('picture');
    this.xmlStream.collect('param');
    this.xmlStream.on('endElement: offer', function (item) {
        var n = item.name.toLowerCase().split(" ");
        for (var i = 0; i < n.length; i++) {
            if (ruleList.rules.product.name.whitelist.indexOf(n[i]) != -1) {
                self.importItem(item);
                //  self.emit('itemImportDone', item);
            }
        }
        for (var i = 0; i < n.length; i++) {
            if (ruleList.rules.product.name.blacklist.indexOf(n[i]) != -1) {
                //  return self.emit('itemImportBlocked', item);
            }
        }
         self.emit('itemImportNeedUser', item);
       self.importItem(item);
     //  this.xmlStream.pause();
       
    });
}

module.exports = FeedImport;