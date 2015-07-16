var fs = require('fs')
    , gm = require('gm').subClass({imageMagick: true})
    , supportedFormats = require('../config/config.json').supportedFormats
    , imageInfo = require('../config/config.json').imageInfo
    , config = require('../config/config.json')
    , logger = require('./logger')
    , Q = require('q')
    , extend = require('util')._extend;

module.exports = function (req, options, callback) {

  var opt = extend({}, options);
  var name = opt.imageInfo.suffix || ''
      , width = opt.imageInfo.width || 100
      , height = opt.imageInfo.height || 100
      , image = opt.image || {}
      , dataForUrlFormation = opt.dataForUrlFormation || {};
  var deffered = Q.defer();
  imagePath = image.path.replace(/(\.jpeg|\.jpg|\.png)$/i, function (ext) {
          return name + ext;
        });

  gm(image.path)
  .resize(width, height)
  .write(imagePath, function (err) {
    if (!err) {
      callback(opt, deffered);
    }
  });

  return deffered.promise;
};
