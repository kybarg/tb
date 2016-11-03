var fs = require('fs')
var path = require('path')
var crypto = require('crypto')

function getFilename(req, file, cb) {
  crypto.pseudoRandomBytes(16, function (err, raw) {
    if (err) return cb(err)
    cb(null, raw.toString('hex') + Date.now().toString() + path.extname(file.originalname))
  })
};

function getDestination(req, file, cb) {
  cb(null, this.pictPath)
};

function pictStorage(pictPath) {
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

pictStorage.prototype._handleFile = function _handleFile(req, file, cb) {
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

pictStorage.prototype._removeFile = function _removeFile(req, file, cb) {
  var path = file.path

  delete file.destination
  delete file.filename
  delete file.path

  fs.unlink(path, cb)
}

module.exports = function (pictPath) {
  return new pictStorage(pictPath)
}