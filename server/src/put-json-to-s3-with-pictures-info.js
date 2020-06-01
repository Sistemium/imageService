const AWS = require('aws-sdk');
const config = require('../config/config.json');
const s3 = new AWS.S3();
const debug = require('debug')('stm:ims:put-json-to-s3-with-pictures-info');

export default function (metadata, urlData) {

  const key = `${urlData.folder}/${urlData.checksum}/${config.picturesInfoFileName}`;
  const params = {
    Bucket: config.s3.Bucket,
    Key: key,
    Body: JSON.stringify(metadata),
    ContentType: 'application/json',
  };

  return new Promise((resolve, reject) => {
    s3.putObject(params, (err, data) => {
      if (err) {
        debug('putObject error:', err);
        return reject(err);
      }
      debug('putObject', data);
      resolve(data);
    });
  });

};
