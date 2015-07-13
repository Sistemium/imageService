var fs = require('fs')
    , gm = require('gm').subClass({imageMagick: true})
    , supportedFormats = require('../config/config.json').supportedFormats
    , imageInfo = require('../config/config.json').imageInfo
    , config = require('../config/config.json')
    , logger = require('./logger')
    , Q = require('q');

module.exports = function (req, dataForUrlFormation, name, image, callback) {
  var deffered = Q.defer();
  imagePath = image.path.replace(/(\.jpeg|\.jpg|\.png)$/i, function (ext) {
          return name + ext;
        });

  switch (name) {
    case imageInfo.smallImage.suffix:
      gm(image.path)
      .resize(imageInfo.smallImage.width, imageInfo.smallImage.height)
      .write(imagePath, function (err) {
        if (!err) {
          logger.log('info', 'Image was resized and written to %s', imagePath);
          callback(image, dataForUrlFormation, name, deffered);
        }
      });
      break;
    case imageInfo.mediumImage.suffix:
      gm(image.path)
      .resize(imageInfo.mediumImage.width, imageInfo.mediumImage.height)
      .write(imagePath, function (err) {
        if (!err) {
          logger.log('info', 'Image was resized and written to %s', imagePath);
          callback(image, dataForUrlFormation, name, deffered);
        }
      });
      break;
    case imageInfo.thumbnail.suffix:
      gm(image.path)
      .resize(imageInfo.thumbnail.width, imageInfo.thumbnail.height)
      .write(imagePath, function (err) {
        if (!err) {
          logger.log('info', 'Thumbnail was successfully saved at %s', imagePath);
          callback(image, dataForUrlFormation, name, deffered);
        }
      });
      break;
    default: throw new Error('No such option');
  }

  return deffered.promise;
};
