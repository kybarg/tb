'use strict';

var http = require('http'),
  fs = require('fs'),
  path = require('path'),
  async = require('async'),
  events = require('events'),
  util = require('util'),
  contentDisposition = require('content-disposition'),
  XmlStream = require('xml-stream'),
  ruleList = require(path.resolve('./modules/import/lib/feed_import')),
  mongoose = require('mongoose'),
  Product = mongoose.model('Product'),
  config = require(path.resolve('./config/config'));

function FeedImport(source) {
  if (typeof source === 'string') {
    this.source = {
      url: source,
      lastUpdate: 0
    }
  } else {
    this.source = source;
  }
  this.createdDate = Date.now();
  this.downloadStartedDate = 0;
  //exclude download time
  this.importStartDate = 0;
  this.downloadTime = 0;
  this.workTime = 0;
  this._importTime = 0;
  this.state = 'idle';
  this.importStats = {
    new: 0,
    updated: 0,
    deleted: 0,
    blocked: 0,
    ignored: 0
  };
  this.categories = {};
  this.importStreamFile = {};
}

util.inherits(FeedImport, events.EventEmitter);

FeedImport.prototype.downloadFeed = function (callback) {
  console.log('downloading from ' + this.source.url);
  var self = this;
  var downloadTime;
  try {
    var request = http.get(this.source.url, function (response) {
      if (response.statusCode === 200) {
        var fileName = contentDisposition.parse(response.headers['content-disposition']).parameters.filename;
        self.importStreamFile = fs.createWriteStream(fileName);
        self.importStreamFile.on('finish', function () {
          self.downloadTime = process.hrtime(downloadTime)[0];
          self.workTime = process.hrtime(downloadTime)[0];
          self.xmlStream = new XmlStream(fs.createReadStream(fileName));
          self.emit('download', self.xmlStream);
          console.log('download done');
          self.state = 'download_done';
          callback();
        });
        self.importStreamFile.on('error', function () {
          self.workTime = process.hrtime(downloadTime)[0];
          self.emit('downloadError', filename);
          fs.unlink(fileName);
          self.state = 'download_error';
          console.log('failed to download ' + fileName);
          callback();
        });
        response.pipe(file);
        this.downloadStartedDate = Date.now();
        downloadTime = process.hrtime();
      } else {
        self.emit('httpError', response.statusMessage);
        console.log(response.statusCode + " " + response.statusMessage);
        callback();
      }
    });
  } catch (e) {
    // err = e;
    self.state = 'download_error';
    console.log(e);
    callback();
  }
}

FeedImport.prototype.downloadPicture = function (url, callback) {
  var dest = config.uploads.product.image.dest;
  var request = http.get(url, function (response) {
    if (response.statusCode === 200) {

      //todo retry on error

      var fileName = crypto.pseudoRandomBytes(16).toString('hex') + Date.now().toString() + path.extname(url);
      var file = fs.createWriteStream(path.join(dest, fileName));
      file.on('finish', function () {
        callback(null, {
          destination: dest,
          filename: fileName
        });
      });
      file.on('error', function () {
        fs.unlink(fileName);
        callback(new Error('picture download failed'), null);
      });
      response.pipe(file);
    } else {
      callback(new Error(response.statusMessage), null);
    }
  });
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
  this.importStartDate = Date.now();
  this._importTime = process.hrtime();
  this.pictDownloadQueue = async.queue(function (data, callback) {
    var picts = [].concat(data.picts);
    var product = data.product;
    var pictureFiles = [];
    async.eachSeries(picts, function (picture, done) {
      self.downloadPicture(picture, function (err, file) {
        if (!err) {
          pictureFiles.push(file);
        } else {
          console.log(err.message)
        }
        done();
      });
    }, function () {
      product.picturesToUpload = pictureFiles;
      product.save(function () {
        callback();
      });
    });
  }, 1);
  this.state = 'working';
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
    self.workTime = self.workTime + process.hrtime(self._importTime)[0];
  });
}

FeedImport.prototype.isPaused = function () {
  if (this.xmlStream && this.xmlStream._suspended != undefined) {
    if (Boolean(this.xmlStream._suspended)) {
      return true;
    } else {
      return false;
    }
  }
  return undefined;
}

FeedImport.prototype.pause = function () {
  var paused = this.isPaused();
  if (paused != undefined && !paused) {
    this.xmlStream.pause();
    this.state = 'paused';
    this.workTime = this.workTime + process.hrtime(this._importTime)[0];
  }
}

FeedImport.prototype.resume = function () {
  var paused = this.isPaused();
  if (paused != undefined && paused) {
    this.xmlStream.resume();
    this.state = 'working';
    this._importTime = process.hrtime();
  }
}


FeedImport.prototype.streamPos = function () {
  return this._stream && this._stream.pos ? this._stream.pos : 0;
};

FeedImport.prototype.streamLength = function () {
  return this._stream ? this._stream.length : 0;
}

FeedImport.prototype.importProgress = function () {
  if (this._stream && this._stream.length && this._stream.pos) {
    return (100 * this._stream.pos / this._stream.length).toFixed();
  } else {
    return 0;
  }
}

FeedImport.prototype.getInfo = function () {
  return {
    status: this.state,
    createDate: this.createdDate,
    downloadTime: this.downloadTime,
    downloadStartDate: this.downloadStartedDate,
    importStartDate: this.importStartDate,
    workTime: this.workTime,
    streamSize: this.streamLength(),
    streamPos: this.streamPos(),
    importStats: this.importStats
  };
}

module.exports = FeedImport;
