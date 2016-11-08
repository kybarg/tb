var http = require('http');
var fs = require('fs');
var async = require('async');
var contentDisposition = require('content-disposition');

function FeedImport(url) {
    this.url = url;
}

FeedImport.prototype.import = function (err, callback) {
    console.log('importing from ' + this.url);
    try {
        var request = http.get(this.url, function (response) {
            if (response.statusCode === 200) {
                var fileName = contentDisposition.parse(response.headers['content-disposition']).parameters.filename;
                var file = fs.createWriteStream(fileName);
                file.on('finish', function () {
                    // make an import
                    fs.unlink(fileName);
                    console.log('done');
                    callback();
                })
                file.on('error', function () {
                    fs.unlink(fileName);
                    console.log('failed to download ' + fileName);
                    callback();
                })
                response.pipe(file);
            } else {
                console.log(response.statusCode + " " + response.statusMessage);
                callback();
            }
        })
    } catch (e) {
        console.log(e);
        callback();
    }
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