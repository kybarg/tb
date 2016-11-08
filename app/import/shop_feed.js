var mongoose = require('mongoose');
var configDB = require('../config/database.js');
var Shop = require('../models/shop');
var FeedImport = require('../import/feed_import.js');

importShopsFeed = function () {
    mongoose.connect(configDB.url);
    Shop.find({}, function (err, docs) {
        var feeds = [];
        for (i = 0; i < docs.length; i++){
            if (docs[i].feedUrl){
                feeds.push(docs[i].feedUrl)
            }
        }
        mongoose.connection.close();
        FeedImport.importMany(feeds);
      })
}

importShopsFeed();



