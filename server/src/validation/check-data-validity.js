const config = require('../../config/config.json');
const imageInfo = config.imageInfo;
const format = config.format;
const _ = require('lodash');
const debug = require('debug')('stm:ims:check-data-validity');

module.exports = function (data) {

  return new Promise((resolve, reject) => {

    var valid = true;
    _.each(imageInfo, function (item, key) {
      if (!_.find(data, objFromS3 => {
          var ext = key === 'original' ? '.*' : format;
          return !!objFromS3.Key.match(`.*/${key}.${ext}$`);
        })) {
        debug('Not found file', key);
        return valid = false;
      }
    });

    if (valid) {
      debug('S3 data valid');
      resolve();
    } else {
      debug('S3 data invalid');
      reject('S3 data invalid');
    }

  });

};
