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

const debug = require('debug')('stm:ims:process-request');

function getResponseAndCleanup(req, res, next) {
  var dataForUrlFormation = {
    checksum: req.image.checksum,
    folder: req.body.folder || req.query.folder
  };
  getResponse(req, res, next, dataForUrlFormation)
  .then(() => cleanupFiles(req.image.folder ,req.image.name, next))
  .catch(next);
}

function processImage(req, res, next) {
  generateChecksum(req.image.path)
  .then(checksum => {
    req.image.checksum = checksum;
    notAlreadyUploadedOrBadData(req)
    .then(() => putAllFilesToS3(req, next)
    .then(() =>getResponseAndCleanup(req, res, next))
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

module.exports = function () {
  return function (req, res, next) {
    if (req.files.file !== undefined) {
      debug('Multipart file upload');
      var image = req.files.file;
      var folder = config.uploadFolderPath + '/' + uuid.v4();
      var img = {
        path: image.path,
        name: image.name,
        folder: folder
      };
      mkdirp(folder, function () {
        var image = {
          path: img.path,
          name: img.name,
          folder: img.folder
        };
        req.image = image;
        var writeStream = fs.createWriteStream(folder + '/' + img.name);
        req.pipe(writeStream);
        writeStream.on('finish', function () {
          checkFormatAndStartProcessing(req, res, next);
        });
      });
    } else if (req.imageFromSrc) {
      debug('image from src');
      checkFormatAndStartProcessing(req, res, next);
    } else {
      debug('Binary content request');
      var folder = config.uploadFolderPath + '/' + uuid.v4();
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
