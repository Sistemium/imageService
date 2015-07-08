var config = require('../config/config.json')
    , checkFormat = require('./check-format')
    , putAllFilesToS3 = require('./put-all-files-to-s3')
    , notAlreadyUploaded = require('./check-if-checksum-exist-on-s3')
    , checksum = require('./generate-checksum')
    , getResponse = require('./get-response')
    , cleanupFiles = require('./cleanup')
    , logger = require('./logger')
    , fs = require('fs')
    , Q = require('q');

function cleanupAndGetResponse(res, checksum, imageName) {
  cleanupFiles(imageName);
  getResponse(res, checksum);
}

function processImage(req, res, image) {
  checksum(image.path)
  .then(function(checksum) {
    notAlreadyUploaded(checksum)
    .then(function() {
      putAllFilesToS3(req, checksum, image)
      .then(function() {
        cleanupAndGetResponse(res, checksum, image.name);
      }, function(err) {
        logger.log('error', err);
        throw new Error(err);
      });
    }, function() {
        cleanupAndGetResponse(res, checksum, image.name);
    });
  }, function (error) {
    logger.log('error', error);
    throw new Error(err);
  });
}

function checkFormatAndStartProcessing(req, res, image) {
  checkFormat(image).then(function(image) {
      logger.log('info', 'Strarting processing image');
      processImage(req, res, image);
  }, function(err) {
      logger.log('error', err);
      throw new Error(err);
  });
}

module.exports = function(req, res) {
  if (req.files.file !== undefined) {
    var image = req.files.file;
    logger.log('info', image);
    image = {
      path: image.path,
      name: image.name
    };
    checkFormatAndStartProcessing(req, res, image);
  } else {
    logger.log('info', 'Binary content request in');
    var imageName = config.imageName + '.' + config.imageExtension;
    var imagePath = config.uploadFolderPath + '/' + imageName;
    req.pipe(fs.createWriteStream(imagePath));
    var image = {
      path: imagePath,
      name: imageName
    };
    checkFormatAndStartProcessing(req, res, image);
  }
}
