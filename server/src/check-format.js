var supportedFormats = require('../config/config.json').supportedFormats
    , config = require('../config/config.json')
    , gm = require('gm').subClass({imageMagick: true})
    , _ = require('lodash')
    , Q = require('q');

module.exports = function(image) {
  var deffered = Q.defer();
  gm(image.path)
  .format(function (err, format) {
    if (err) return;

    var isSupportedFormat = _.some(supportedFormats, function (item) {
      return format.toLowerCase() === item.toLowerCase();
    });
    if (isSupportedFormat) {
      image.contentType = config.contentTypeFor[format.toLowerCase()];
      deffered.resolve(image);
    } else {
      deffered.reject('Unsupported format..');
    }
  });
  return deffered.promise;
};
