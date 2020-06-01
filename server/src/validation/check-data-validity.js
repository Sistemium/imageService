import _ from 'lodash';

const config = require('../../config/config.json');
const { imageInfo, format } = config;
const debug = require('debug')('stm:ims:check-data-validity');

export default function (data) {

  return new Promise((resolve, reject) => {

    let valid = true;

    _.each(imageInfo, function (item, key) {
      if (!_.find(data, objFromS3 => {
        const ext = key === 'original' ? '.*' : format;
        return !!objFromS3.Key.match(`.*/${key}.${ext}$`);
      })) {
        debug('Not found file', key);
        valid = false;
        return false;
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
