var supportedFormats = require('../config/config.json').supportedFormats
    , config = require('../config/config.json')
    , gm = require('gm').subClass({imageMagick: true})
    , _ = require('lodash')
    , logger = require('./logger')
    , Q = require('q');

module.exports = function(image) {
  var deffered = Q.defer();
  logger.log('info', 'Checking file format');
  gm(image.path)
  .format(function (err, format) {
    if (err) {
      logger.log('error', err);
      throw new Error(err);
    };

    var isSupportedFormat = _.some(supportedFormats, function (item) {
      return format.toLowerCase() === item.toLowerCase();
    });
    if (isSupportedFormat) {
      image.contentType = config.contentTypeFor[format.toLowerCase()];
      logger.log('info', 'Format is supported, contentType: %s', image.contentType);
      deffered.resolve(image);
    } else {
      deffered.reject('Unsupported format..');
    }
  });
  return deffered.promise;
};