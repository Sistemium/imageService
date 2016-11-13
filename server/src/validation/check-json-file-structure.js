const AWS = require('aws-sdk');
const config = require('../../config/config.json');
const _ = require('lodash');
const debug = require('debug')('stm:ims:check-json-file-structure');

module.exports = function(prefix) {

  var s3 = new AWS.S3(config.awsCredentials);
  var key = prefix + config.picturesInfoFileName;
  var params = {
    Bucket: config.s3.Bucket,
    Key: key
  };

  debug('Key: %s', key);

  return new Promise((resolve, reject) => {
    s3.getObject(params, function(err, data) {

      if (err) {
        debug('Error: %s', err);
        return reject(err);
      }

      var parsedData = JSON.parse(data.Body.toString());

      _.each(config.imageInfo, function(n, key) {
        var res = _.filter(parsedData, {
          'name': key
        });
        if (res.length !== 1) {
          reject(new Error('Incorrect \"' + config.picturesInfoFileName + '\"'));
        }
      });

      resolve();

    });
  });

}
