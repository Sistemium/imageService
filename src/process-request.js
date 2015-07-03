var config = require('../config/config.json')
    , putAllFilesToS3 = require('./put-all-files-to-s3')
    , notAlreadyUploaded = require('./check-if-checksum-exist-on-s3')
    , checksum = require('./generate-checksum')
    , getResponse = require('./get-response')
    , cleanupFiles = require('./cleanup')
    , Q = require('q');

module.exports = function() {
  return function(req, res, next) {
    var image = req.files.filedata;
    checksum(image.path)
    .then(function(checksum) {
      notAlreadyUploaded(checksum)
      .then(function() {
        putAllFilesToS3(req, checksum)
        .then(function() {
          cleanupFiles(config.uploadFolderPath);
          getResponse(res, checksum);
          next();
        }, function(err) {
          console.log(err);
        });
      }, function() {
        cleanupFiles(config.uploadFolderPath);
        getResponse(res, checksum);
        next();
      });
    }, function (error) {
      console.log(error);
    });
  }
}
