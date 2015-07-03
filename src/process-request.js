var config = require('../config/config.json')
    , putAllFilesToS3 = require('./put-all-files-to-s3')
    , notAlreadyUploaded = require('./check-if-checksum-exist-on-s3')
    , checksum = require('./generate-checksum')
    , getResponse = require('./get-response')
    , cleanupFiles = require('./cleanup')
    , logger = require('./logger')
    , Q = require('q');

function cleanupAndGetResponse(res, checksum, folder, imageName) {
  cleanupFiles(folder, imageName);
  getResponse(res, checksum);
}

module.exports = function() {
  return function(req, res) {
    var image = req.files.filedata;
    checksum(image.path)
    .then(function(checksum) {
      notAlreadyUploaded(checksum)
      .then(function() {
        putAllFilesToS3(req, checksum)
        .then(function() {
          cleanupAndGetResponse(res, checksum, config.uploadFolderPath, image.name);
        }, function(err) {
          logger.log('error', err);
        });
      }, function() {
          cleanupAndGetResponse(res, checksum, config.uploadFolderPath, image.name);
      });
    }, function (error) {
      logger.log('error', error);
    });
  }
}
