import _ from 'lodash';
import AWS from 'aws-sdk';

const config = require('../../config/config.json');
const debug = require('debug')('stm:ims:check-json-file-structure');
const s3 = new AWS.S3();

export default function (prefix) {

  const key = prefix + config.picturesInfoFileName;
  const params = {
    Bucket: config.s3.Bucket,
    Key: key
  };

  debug('Key: %s', key);

  return new Promise((resolve, reject) => {
    s3.getObject(params, (err, data) => {

      if (err) {
        debug('Error:', err.message);
        return reject(new Error(err.message));
      }

      const parsedData = JSON.parse(data.Body.toString());

      _.each(config.imageInfo, function (n, key) {
        const res = _.filter(parsedData, { name: key });
        if (res.length !== 1) {
          reject(new Error(`Incorrect "${config.picturesInfoFileName}"`));
        }
      });

      resolve();

    });
  });

}
