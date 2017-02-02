'use strict';

var http = require('http'),
  fs = require('fs'),
  path = require('path'),
  async = require('async'),
  events = require('events'),
  util = require('util'),
  contentDisposition = require('content-disposition'),
  XmlStream = require('xml-stream'),
  ruleList = require(path.resolve('./modules/import/lib/import_rules')),
  mongoose = require('mongoose'),
  Product = mongoose.model('Product'),
  Category = mongoose.model('Category'),
  crypto = require('crypto'),
  config = require(path.resolve('./config/config'));


var getCategoriesMask = function (callback) {
  Category.find().exec(function (err, categories) {
    callback(err, categories);
  });
}

var dbCategoriesMask = {
  inner: {}
};

getCategoriesMask(function (err, categories) {
  function sortCat(field, cat) {
    for (var i = 0; i < categories.length; i++) {
      if (categories[i].parent) {
        if (categories[i].parent.toString() == cat._id.toString()) {
          if (!field.inner) {
            field.inner = {};
          }
          field.inner[categories[i].name] = (categories[i]);
          sortCat(field.inner[categories[i].name], categories[i]);
        }
      }
    }
  }
  for (var i = 0; i < categories.length; i++) {
    if (!categories[i].parent) {
      if (!dbCategoriesMask.inner) {
        dbCategoriesMask.inner = {};
      }
      dbCategoriesMask.inner[categories[i].name] = categories[i];
      sortCat(dbCategoriesMask.inner[categories[i].name], categories[i])
    }
  }
});


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
  // this.importStreamFile = {};
  this.processedCategories = {};
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
  var finalCategoryTree = [];
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
        this.importStats.ignored++;
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
          this.importStats.ignored++;
          return self.emit('itemImportIgnored', item);
        } else {
          product.sex = value;
        }
      }
    }
  }

  switch (product.age) {
    case 1:
      finalCategoryTree.push('Для малышей');
      break;
    case 2:
      finalCategoryTree.push(product.sex == 1 ? 'Девочке' : product.sex == 2 ? 'Мальчику' : '');
      break;
    case 3:
      finalCategoryTree.push(product.sex == 1 ? 'Женщине' : product.sex == 2 ? 'Мужчине' : '');
  }

  finalCategoryTree.push(category.type);
  if (category.sub_type != '') {
    finalCategoryTree.push(category.sub_type);
  }
  finalCategoryTree.push(category.category_name);

  product.description = item.description;
  product.price = parseInt(item.price);
  product.oldPrice = item.oldprice !== undefined ? parseInt(item.oldprice) : null;
  product.url = item.url;
  product.shop = this.source.id !== undefined ? this.source : null;
  this.productImportQueue.push({
    product: product,
    pictures: picts,
    categoryTree: finalCategoryTree
  });
}

FeedImport.prototype.startImport = function () {
  var self = this;
  this.importStartDate = Date.now();
  this._importTime = process.hrtime();
  this.productImportQueue = async.queue(function (data, callback) {
    var pictureFiles = [];
    self.processCategory(data.categoryTree, data.product, function (product) {
      if (!product) {
        console.log('cant get category');
        return callback();
      }
      console.log(product);
      return callback();
      async.eachSeries(data.pictures, function (picture, done) {
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
          self.importStats.new++;
          self.workTime = self.workTime + process.hrtime(self._importTime)[0];
          callback();
        });
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
      self.importStats.blocked++;
      return self.emit('itemImportBlocked', item);
    };

    switch (undefined) {
      case item.vendor:
      case item.picture:
      case item.price:
        self.importStats.ignored++;
        return self.emit('itemImportIgnored', item);
    }
    self.importItem(item);
    });
  this.xmlStream.on('end', function () {
    self.source.lastUpdate = Date.now;
    console.log('stream parsed');
  });
}

FeedImport.prototype.processCategory = function (categoryTree, product, callback) {
  var self = this;
  var currentCat = dbCategoriesMask;
  var catParent;
  var pos = 0;

  console.log(categoryTree);

  function checkCat() {
    if (pos === categoryTree.length) {
      if (currentCat) {
        product.category.push(currentCat);
        self.processedCategories[categoryTree.toString()] = currentCat;
        return callback(product);
      }
      return callback(undefined);
    }
    var catName = categoryTree[pos];
    if (!currentCat.inner[catName]) {
      var category = new Category({
        name: catName,
        parent: catParent ? catParent : undefined
      });
      category.inner = {};
      currentCat.inner[catName] = category;
      category.save(function (err, category) {
        if (catParent) {
          catParent.inner[category.name] = category;
        }
        catParent = category;
        currentCat = currentCat.inner[catName];
        pos++;
        checkCat();
      });
    } else {
      currentCat = currentCat.inner[catName];
      if (!currentCat.inner) {
        currentCat.inner = {};
      }
      catParent = currentCat;
      if (!catParent.inner) {
        catParent.inner = {}
      }
      pos++;
      checkCat();
    }
  }
  if (!this.processedCategories[categoryTree.toString()]) {
    checkCat();
  } else {
    product.category.push(this.processedCategories[categoryTree.toString()]);
    callback(product);
  }
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

FeedImport.prototype.queuedItemsCount = function () {
  if (this.productImportQueue) {
    return this.pictDownloadQueue.length;
  }
  return 0;
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
    itemsInQueue: this.queuedItemsCount(),
    importStats: this.importStats
  };
}

module.exports = FeedImport;
