var config = require('../../config/config.json')
    , gm = require('gm').subClass({imageMagick: true})
    , _ = require('lodash')
    , Q = require('q');

module.exports = function(image) {
  var deffered = Q.defer();
  var timestamp = Date.now();
  console.log(timestamp + ' info: Checking file format');
  gm(image.path)
  .format(function (err, format) {
    if (err) {
      timestamp = Date.now();
      console.log(timestamp + ' error: %s', err);
      throw new Error(err);
    };

    if (config.contentTypeFor[format.toLowerCase()]) {
      image.contentType = config.contentTypeFor[format.toLowerCase()];
      timestamp = Date.now();
      console.log(timestamp + ' info: Format is supported, contentType: %s', image.contentType);
      deffered.resolve();
    } else {
      deffered.reject('Unsupported format..');
    }
  });
  return deffered.promise;
};
