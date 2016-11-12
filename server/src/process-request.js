const config = require('../config/config.json')
const checkFormat = require('./validation/check-format')
const putAllFilesToS3 = require('./put-all-files-to-s3')
const notAlreadyUploadedOrBadData = require('./validation/check-if-checksum-exist-on-s3')
const generateChecksum = require('./generate-checksum')
const getResponse = require('./get-response')
const cleanupFiles = require('./cleanup')
const fs = require('fs')
const mkdirp = require('mkdirp')
const uuid = require('node-uuid')
const _ = require('lodash');

const debug = require('debug')('stm:ims:process-request');

function getResponseAndCleanup(req, res, next) {
  var dataForUrlFormation = {
    checksum: req.image.checksum,
    folder: req.body.folder || req.query.folder
  };
  getResponse(req, res, next, dataForUrlFormation)
    .then(() => cleanupFiles(req.image.folder, req.image.name, next))
    .catch(next);
}

function processImage(req, res, next) {
  generateChecksum(req.image.path)
    .then(checksum => {
      req.image.checksum = checksum;
      notAlreadyUploadedOrBadData(req)
        .then(() => putAllFilesToS3(req, next)
          .then(() => getResponseAndCleanup(req, res, next))
          .catch(next))
        .catch(() => getResponseAndCleanup(req, res, next));
    })
    .catch(next);
}

function checkFormatAndStartProcessing(req, res, next) {
  checkFormat(req.image)
    .then(image => {
      debug('checkFormatAndStartProcessing start');
      processImage(req, res, next);
    })
    .catch(next);
}

module.exports = function() {
  return function(req, res, next) {

    debug('Multipart file upload', req.files);
    var file = _.first(req.files);
    var folder = config.uploadFolderPath + '/' + uuid.v4();

    if (file) {

      var img = {
        path: file.path,
        name: file.filename,
        folder: folder
      };

      mkdirp(folder, function() {
        var writeStream = fs.createWriteStream(folder + '/' + img.name);
        req.pipe(writeStream);
        req.image = img;
        writeStream.on('finish', function() {
          checkFormatAndStartProcessing(req, res, next);
        });
      });

    } else if (req.imageFromSrc) {

      debug('image from src');
      checkFormatAndStartProcessing(req, res, next);

    } else {

      debug('Binary content request');
      var imageName = config.imageInfo.original.name + '.' + config.format;
      var imagePath = folder + '/' + imageName;

      mkdirp(folder, () => {
        var image = {
          path: imagePath,
          name: imageName,
          folder: folder
        };
        req.image = image;
        var writeStream = fs.createWriteStream(imagePath);
        writeStream.on('finish', () => checkFormatAndStartProcessing(req, res, next));
        req.pipe(writeStream);
      });

    }
  }
};
