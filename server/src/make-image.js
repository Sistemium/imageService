var fs = require('fs')
    , gm = require('gm').subClass({imageMagick: true})
    , config = require('../config/config.json').imageInfo
    , imageSuffixes = require('../config/config.json').imageInfo.imageSuffixes
    , logger = require('./logger')
    , _ = require('lodash')
    , Q = require('q');
/**
 * name size of the image: _small. _medium. _thumbnail.
 **/
module.exports = function (req, checksum, name, image, callback) {
  var deffered = Q.defer();
  gm(image.path)
  .format(function (err, format) {
    if (err) return;

    var imagePath = undefined;
    var isSupportedFormat = _.some(config.supportedFormats, function (item) {
      return format.toLowerCase() === item.toLowerCase();
    });
    if (isSupportedFormat) {
      imagePath = image.path.replace(/(\.jpeg|\.jpg|\.png)$/i, function (ext) {
          return name + ext;
        });
    } else {
      throw new Error('Unsupported image format...');
    }

    switch (name) {
      case imageSuffixes[0]:
        gm(image.path)
        .resize(config.smallImage.width, config.smallImage.height)
        .write(imagePath, function (err) {
          if (!err) {
            logger.log('info', 'Image was resized and written to %s', imagePath);
            callback(image, checksum, name, deffered);
          }
        });
        break;
      case imageSuffixes[1]:
        gm(image.path)
        .resize(config.mediumImage.width, config.mediumImage.height)
        .write(imagePath, function (err) {
          if (!err) {
            logger.log('info', 'Image was resized and written to %s', imagePath);
            callback(image, checksum, name, deffered);
          }
        });
        break;
      case imageSuffixes[2]:
        gm(image.path)
        .resize(config.thumbnail.width, config.thumbnail.height)
        .write(imagePath, function (err) {
          if (!err) {
            logger.log('info', 'Thumbnail was successfully saved at %s', imagePath);
            callback(image, checksum, name, deffered);
          }
        });
        break;
    }
  });
  return deffered.promise;
};
