var AWS = require('aws-sdk')
    , config = require('../config/config.json')
    , Q = require('q')
    , logger = require('./logger');

module.exports = function(checksum, body) {
  var deffered = Q.defer()
      , s3 = new AWS.S3(config.awsCredentials)
      , params = {
          Bucket: config.s3.Bucket,
          Prefix: body.folder + '/'
                  + body.org + '/'
                  + body.time
                  + checksum + '/'
        };

  s3.listObjects(params, function(err, data) {
    if (err) logger.log('error', err);
    else {
      if (data.Contents && data.Contents.length > 0) {
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
