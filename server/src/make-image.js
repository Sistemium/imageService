var fs = require('fs')
    , gm = require('gm').subClass({imageMagick: true})
    , config = require('../config/config.json').imageSizes
    , logger = require('./logger')
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
    if (format === 'PNG' || format === 'JPG') {
      imagePath = image.path.slice(0, -4) + name + format.toLowerCase();
    }
    else if (format === 'JPEG') {
      imagePath = image.path.slice(0, -5) + name + 'jpeg';
    }
    else {
      throw new Error('Unsupported image format...');
    }

    switch (name) {
      case '_small.' :
        gm(image.path)
        .resize(config.smallImage.width, config.smallImage.height)
        .write(imagePath, function (err) {
          if (!err) {
            logger.log('info', 'Image was resized and written to %s', imagePath);
            callback(image, checksum, name.slice(0, -1), deffered);
          }
        });
        break;
      case '_medium.' :
        gm(image.path)
        .resize(config.mediumImage.width, config.mediumImage.height)
        .write(imagePath, function (err) {
          if (!err) {
            logger.log('info', 'Image was resized and written to %s', imagePath);
            callback(image, checksum, name.slice(0, -1), deffered);
          }
        });
        break;
      case '_thumbnail.' :
        gm(image.path)
        .resize(config.thumbnail.width, config.thumbnail.height)
        .write(imagePath, function (err) {
          if (!err) {
            logger.log('info', 'Thumbnail was successfully saved at %s', imagePath);
            callback(image, checksum, name.slice(0, -1), deffered);
          }
        });
        break;
    }
  });
  return deffered.promise;
};
