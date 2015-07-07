var AWS = require('aws-sdk')
    , config = require('../config/config.json')
    , Q = require('q')
    , logger = require('./logger');

module.exports = function(checksum) {
  var deffered = Q.defer()
      , s3 = new AWS.S3()
      , params = {
          Bucket: config.s3.Bucket,
          Prefix: checksum + '/'
        };

  s3.listObjects(params, function(err, data) {
    if (err) logger.log('error', err);
    else {
      if (data.Contents.length > 0) {
        logger.log('info', 'Image with checksum %s already uploaded', checksum);
        deffered.reject();
      } else {
        logger.log('info', 'No images with checksum %s', checksum);
        deffered.resolve();
      }
    }
  });

  return deffered.promise;
};
