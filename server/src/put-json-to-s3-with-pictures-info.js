const AWS = require('aws-sdk');
const config = require('../config/config.json');
const s3 = new AWS.S3(config.awsCredentials);
const debug = require('debug')('stm:ims:put-json-to-s3-with-pictures-info');

module.exports = function (metadata, urlData) {

  var key = `${urlData.folder}/${urlData.checksum}/${config.picturesInfoFileName}`;
  var params = {
    Bucket: config.s3.Bucket,
    Key: key,
    Body: JSON.stringify(metadata),
    ContentType: 'application/json'
  };

  return new Promise((resolve, reject) => {
    s3.putObject(params, function (err, data) {
      if (err) {
        debug('putObject error:', err);
        return reject(err);
      }
      debug('putObject', data);
      resolve(data);
    });
  });

};
