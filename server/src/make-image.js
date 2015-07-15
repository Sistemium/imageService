var fs = require('fs')
    , gm = require('gm').subClass({imageMagick: true})
    , supportedFormats = require('../config/config.json').supportedFormats
    , imageInfo = require('../config/config.json').imageInfo
    , config = require('../config/config.json')
    , logger = require('./logger')
    , Q = require('q');

module.exports = function (req, options, callback) {
  logger.log('info', 'Options: %s', JSON.stringify(options));
  var name = options.imageInfo.suffix || ''
      , width = options.imageInfo.width || 100
      , height = options.imageInfo.height || 100
      , image = options.image || {}
      , dataForUrlFormation = options.dataForUrlFormation || {};

  var deffered = Q.defer();
  imagePath = image.path.replace(/(\.jpeg|\.jpg|\.png)$/i, function (ext) {
          return name + ext;
        });

  gm(image.path)
  .resize(width, height)
  .write(imagePath, function (err) {
    if (!err) {
      logger.log('info', 'Image is resized and written to %s', imagePath);
      callback(options, deffered);
    }
  });

  return deffered.promise;
};
