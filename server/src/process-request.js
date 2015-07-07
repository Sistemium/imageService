var config = require('../config/config.json')
    , putAllFilesToS3 = require('./put-all-files-to-s3')
    , notAlreadyUploaded = require('./check-if-checksum-exist-on-s3')
    , checksum = require('./generate-checksum')
    , getResponse = require('./get-response')
    , cleanupFiles = require('./cleanup')
    , logger = require('./logger')
    , fs = require('fs')
    , Q = require('q');

function cleanupAndGetResponse(res, checksum, folder, imageName) {
  cleanupFiles(folder, imageName);
  getResponse(res, checksum);
}

function processImage(req, res, imagePath, imageName) {
  checksum(imagePath)
  .then(function(checksum) {
    notAlreadyUploaded(checksum)
    .then(function() {
      putAllFilesToS3(req, checksum, imagePath, imageName)
      .then(function() {
        cleanupAndGetResponse(res, checksum, config.uploadFolderPath, imageName);
      }, function(err) {
        logger.log('error', err);
      });
    }, function() {
        cleanupAndGetResponse(res, checksum, config.uploadFolderPath, imageName);
    });
  }, function (error) {
    logger.log('error', error);
  });
}

module.exports = function(req, res) {
  if (req.files.file !== undefined) {
    var image = req.files.file;
    logger.log('info', image);
    processImage(req, res, image.path, image.name);
  } else {
    logger.log('info', 'Binary content request in');
    var imageName = config.imageInfo.imageName + '.' + config.imageInfo.imageExtension;
    var imagePath = config.uploadFolderPath + '/' + imageName;
    req.pipe(fs.createWriteStream(imagePath));
    processImage(req, res, imagePath, imageName);
  }
}
