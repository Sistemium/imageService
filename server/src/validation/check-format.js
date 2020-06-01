const config = require('../../config/config.json');
const gm = require('gm').subClass({
  imageMagick: true
});
const debug = require('debug')('stm:ims:check-format');

export default function (image) {

  debug('Checking file format');

  return new Promise((resolve, reject) => {
    gm(image.path)
      .format((err, format) => {

        if (err) {
          return reject(err)
        }

        if (!config.contentTypeFor && !config.contentTypeFor[format.toLowerCase()]) {
          return reject('Incorrect configuration');
        }

        const contentType = config.contentTypeFor[format.toLowerCase()];

        if (!contentType) {
          return reject('Unsupported format');
        }

        image.contentType = contentType;
        debug('Format is supported, contentType: %s', image.contentType);
        resolve();

      });
  });

};
