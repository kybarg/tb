var http = require('http');
var fs = require('fs');
var async = require('async');
var events = require('events');
var util = require('util');
var contentDisposition = require('content-disposition');
var XmlStream = require('xml-stream');
var Product = require('../models/product');
var pictPath = require('./../config/path.js').productPictPath;
var storage = require('../lib/pictStorage.js')(pictPath);


function RuleFile(file) {
    this.product = {
        name: {
            whitelist: [],
            blacklist: []
        }
    }
    this.file = file;
    try {
        this.product = JSON.parse(fs.readFileSync(file));
    } catch (e) {

    }
}

RuleFile.prototype.addRule = function (path, rule) {
    var p = path.split(".");
    var field = this;
    var t;
    for (var i = 0; i < p.length; i++) {
        t = field[p[i]];
        if (!t) {
            if (Array.isArray(field)) {
                return;
            } else if (i != p.length - 1) {
                field[p[i]] = {};
                field = field[p[i]];
            } else {
                field[p[i]] = [];
                field = field[p[i]];
            }
        } else {
            field = t;
        }
    }
    field.push(rule);
    fs.writeFileSync(this.file, JSON.stringify(this.product));
}

RuleFile.prototype.removeRule = function (rule) {
    //var index = this.rules.indexOf(rule);
    //if (index != -1) {
    //  this.rules.splice(index, 1);
    //  fs.writeFileSync(this.file, JSON.stringify(this.rules));
    // }
}

//var list = new RuleFile('import/rules/blacklist.json');
//list.addRule('product.name.greenlist.list.listoflists', 'dfghjkghsgft67656jk');

var Rules = new RuleFile('import/rules/rules.json');




function FeedImport(source) {
    if (typeof source === 'string') {
        this.source = {
            url: source
        }
    } else {
        this.source = source;
    }
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
    var params = item.param;
    var picts = item.picture;
    var param = item.name;
    for (var i = 0; i < params.length; i++){
        if (Rules[params[i]]){

        }
    }

   //storage.donloadFile()
}



FeedImport.prototype.startImport = function () {
    var self = this;
    this.xmlStream.collect('picture');
    this.xmlStream.collect('param');
    this.xmlStream.on('endElement: offer', function (item) {
        var n = item.name.toLowerCase().split(" ");
        for (var i = 0; i < n.length; i++) {
            if (Rules.product.name.whitelist.indexOf(n[i]) != -1) {
                self.importItem(item);
                return self.emit('itemImportDone', item);
            }
        }
        for (var i = 0; i < n.length; i++) {
            if (Rules.product.name.blacklist.indexOf(n[i]) != -1) {
                return self.emit('itemImportBlocked', item);
            }
        }
        self.emit('itemImportNeedUser', item);  self.importItem(item);
    });
}

FeedImport.importMany = function (feeds, callback) {
    var tasks = feeds.map(function (feed) {
        return function (callback) {
            new FeedImport(feed).import(null, callback)
        }
    })
    async.series(tasks);
}

module.exports = FeedImport;
module.exports.Rules = Rules;