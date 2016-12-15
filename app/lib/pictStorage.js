var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var http = require('http');

function getFilename(req, file, cb) {
  crypto.pseudoRandomBytes(16, function (err, raw) {
    if (err) return cb(err)
    cb(null, raw.toString('hex') + Date.now().toString() + path.extname(file.originalname))
  })
};

function getDestination(req, file, cb) {
  cb(null, this.pictPath)
};

function PictStorage(pictPath) {
  this.pictPath = pictPath;
  this.getFilename = getFilename;
  this.getDestination = getDestination;
  if (!(fs.existsSync(pictPath))) {
    fs.mkdirSync(pictPath, function (err) {
      if (err) {
        console.log("picture path error")
      }
    })
  }
}

PictStorage.prototype.donloadFile = function (url, callback) {
  var dest = this.pictPath;
  var request = http.get(url, function (response) {
    if (response.statusCode === 200) {
      var fileName = crypto.pseudoRandomBytes(16).toString('hex') + Date.now().toString() + path.extname(url);
      var file = fs.createWriteStream(path.join(dest, fileName));
      file.on('finish', function () {
        callback(null, {
          destination: dest,
          filename: fileName
        });
      })
      file.on('error', function () {
        fs.unlink(fileName);
        callback(new Error('picture download failed'), null);
      })
      response.pipe(file);
    } else {
      callback(new Error(response.statusMessage), null);
    }
  })
}



PictStorage.prototype._handleFile = function _handleFile(req, file, cb) {
  var self = this

  self.getDestination(req, file, function (err, destination) {
    if (err) return cb(err)

    self.getFilename(req, file, function (err, filename) {
      if (err) return cb(err)

      var finalPath = path.join(destination, filename)
      var outStream = fs.createWriteStream(finalPath)
      file.stream.pipe(outStream);
      outStream.on('error', cb)
      outStream.on('finish', function () {
        cb(null, {
          destination: destination,
          filename: filename,
          path: finalPath,
          size: outStream.bytesWritten
        })
      })
    })
  })
}

PictStorage.prototype._removeFile = function _removeFile(req, file, cb) {
  var path = file.path
  delete file.destination
  delete file.filename
  delete file.path
  fs.unlink(path, cb)
}

module.exports = function (pictPath) {
  return new PictStorage(pictPath)
}