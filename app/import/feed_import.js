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
        deleted: 0,
        blocked: 0,
        ignored: 0
    };
    this.categories = {};
}

util.inherits(FeedImport, events.EventEmitter);

FeedImport.prototype.downloadFeed = function (callback) {
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
        // err = e;
        console.log(e);
        callback();
    }
}

FeedImport.prototype.importItem = function (item) {
    var self = this;
    var params = item.param;
    var picts = item.picture;
    var product = new Product();
    var rule;
    var value;
    var category;
    var categoryPath;
    product.name = item.name.replace(" " + item.vendor, "");
  //  product.name = item.name;
    category = ruleList.getCategory(product.name);
    if (!category) {
        return self.emit('itemImportNeedUser', item);
    }
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

    if (!product.age) {
        if (self.categories[item.categoryId]) {
            rule = ruleList.getRule('age');
            value = ruleList.getValue(rule, self.categories[item.categoryId]);
            if (!value) {
                importStats.ignored++;
                return self.emit('itemImportIgnored', item);
            } else {
                product.age = value;
            }
        }
    }

    if (!product.sex && product.age != 1) {
        if (category.sex != '') {
            product.sex = category.sex;
        } else {
            if (self.categories[item.categoryId]) {
                rule = ruleList.getRule('gender');
                value = ruleList.getValue(rule, self.categories[item.categoryId]);
                if (!value) {
                    importStats.ignored++;
                    return self.emit('itemImportIgnored', item);
                } else {
                    product.sex = value;
                }
            }
        }
    }

    switch (product.age) {
        case 1:
            categoryPath = 'Для малышей';
            break;
        case 2:
            categoryPath = product.sex == 1 ? 'Девочке' : product.sex == 2 ? 'Мальчику' : '';
            break;
        case 3:
            categoryPath = product.sex == 1 ? 'Женщине' : product.sex == 2 ? 'Мужчине' : '';
    }

    categoryPath = categoryPath.concat('/', category.type, category.sub_type == '' ? '' : '/' + category.sub_type, '/', category.category_name);

    product.description = item.description;
    product.price = parseInt(item.price);
    product.oldPrice = item.oldprice !== undefined ? parseInt(item.oldprice) : null;
    product.url = item.url;
    product.shop = this.source.id !== undefined ? this.source : null;
    self.pictDownloadQueue.push({
        picts: picts,
        product: product
    }, function () {
        self.importStats.new++;
    });
}



FeedImport.prototype.startImport = function () {
    var self = this;
    this.pictDownloadQueue = async.queue(function (prod, callback) {
        var picts = [].concat(prod.picts);
        var product = prod.product;
        async.eachSeries(picts, function (picture, done) {
            storage.downloadFile(picture, function (err, file) {
                if (!err) {
                    product.addPicture(file);
                } else {
                    console.log(err.message)
                }
                done();
            });
        }, function () {
            product.save(function () {
                callback();
            });
        });
    }, 1);
    
    this.xmlStream.on('error', function (e) {
        console.log(e);
    });
    this.xmlStream.collect('category');
    this.xmlStream.on('endElement: categories', function (categories) {
        function chainCat(cat) {
            if (cat.$.parentId && cat.$.parentId != 0) {
                for (var i = 0; i < categories.category.length; i++) {
                    if (categories.category[i].$.id == cat.$.parentId) {
                        var c = {};
                        Object.assign(c, cat);
                        c.$text = chainCat(categories.category[i]).$text + '/' + c.$text;
                        return c;
                    }
                }
            }
            return cat;
        }
        for (var i = 0; i < categories.category.length; i++) {
            self.categories[categories.category[i].$.id] = chainCat(categories.category[i]).$text;
        }
    });

    this.xmlStream.collect('picture');
    this.xmlStream.collect('param');
    this.xmlStream.on('endElement: offer', function (item) {
        if (ruleList.inBlacklist(item.name)) {
            importStats.blocked++;
            return self.emit('itemImportBlocked', item);
        };

        switch (undefined) {
            case item.vendor:
            case item.picture:
            case item.price:
                importStats.ignored++;
                return self.emit('itemImportIgnored', item);
        }
        self.importItem(item);
       });
}

module.exports = FeedImport;