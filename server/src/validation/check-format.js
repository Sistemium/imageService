const config = require('../../config/config.json');
const gm = require('gm').subClass({
  imageMagick: true
});
const _ = require('lodash');
const debug = require('debug')('stm:ims:check-format');

module.exports = function (image) {

  debug('Checking file format');

  return new Promise((resolve, reject) => {
    gm(image.path)
      .format(function (err, format) {

        if (err) {
          return reject(err)
        }

        if (!config.contentTypeFor && !config.contentTypeFor[format.toLowerCase()]) {
          return reject('Incorrect configuration');
        }

        let contentType = config.contentTypeFor[format.toLowerCase()];

        if (!contentType) {
          return reject('Unsupported format');
        }

        image.contentType = contentType;
        debug('Format is supported, contentType: %s', image.contentType);
        resolve();

      });
  });

};
