var config = require('../config/config.json')
    , checkFormat = require('./check-format')
    , putAllFilesToS3 = require('./put-all-files-to-s3')
    , notAlreadyUploaded = require('./check-if-checksum-exist-on-s3')
    , generateChecksum = require('./generate-checksum')
    , getResponse = require('./get-response')
    , cleanupFiles = require('./cleanup')
    , logger = require('./logger')
    , fs = require('fs')
    , Q = require('q');

function getResponseAndCleanup(res, checksum, imageName) {
  getResponse(res, checksum);
  cleanupFiles(imageName);
}

function processImage(req, res, image, body) {
  generateChecksum(image.path)
  .then(function(checksum) {
    notAlreadyUploaded(checksum)
    .then(function() {
      putAllFilesToS3(req, checksum, image, body)
      .then(function() {
        getResponseAndCleanup(res, checksum, image.name);
      }, function(err) {
        logger.log('error', err);
        throw new Error(err);
      });
    }, function() {
        getResponseAndCleanup(res, checksum, image.name);
    });
  }, function (error) {
    logger.log('error', error);
    throw new Error(err);
  });
}

function checkFormatAndStartProcessing(req, res, image, body) {
  checkFormat(image).then(function(image) {
      logger.log('info', 'Strarting processing image');
      logger.log('info', image);
      processImage(req, res, image, body);
  }, function(err) {
      logger.log('error', err);
      throw new Error(err);
  });
}

module.exports = function(req, res) {
  if (req.files.file !== undefined) {
    var image = req.files.file;
    var body = req.body;
    logger.log('info', image);
    image = {
      path: image.path,
      name: image.name
    };
    checkFormatAndStartProcessing(req, res, image, body);
  } else {
    logger.log('info', 'Binary content request in');
    var imageName = config.imageInfo.original.name + '.' + config.imageInfo.original.extension;
    var imagePath = config.uploadFolderPath + '/' + imageName;
    req.pipe(fs.createWriteStream(imagePath));
    var image = {
      path: imagePath,
      name: imageName
    };
    checkFormatAndStartProcessing(req, res, image);
  }
}
