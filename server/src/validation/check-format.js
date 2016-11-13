const config = require('../../config/config.json');
const gm = require('gm').subClass({
  imageMagick: true
});
const _ = require('lodash');
const debug = require('debug')('stm:ims:check-format');

module.exports = function(image) {

  debug('Checking file format');

  return new Promise((resolve, reject) => {
    gm(image.path)
      .format(function(err, format) {

        if (err) {
          throw new Error(err);
        }

        if (!config.contentTypeFor && !config.contentTypeFor[format.toLowerCase()]) {
          throw new Error('Incorrect configuration');
        }

        if (config.contentTypeFor[format.toLowerCase()]) {
          image.contentType = config.contentTypeFor[format.toLowerCase()];
          debug('Format is supported, contentType: %s', image.contentType);
          resolve();
        } else {
          reject('Unsupported format');
        }

      });
  });

};
