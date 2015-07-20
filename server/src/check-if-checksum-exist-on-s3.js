var AWS = require('aws-sdk')
    , config = require('../config/config.json')
    , imagesInfo = config.imagesInfo
    , checkDataValidity = require('./check-data-validity')
    , Q = require('q')
    , logger = require('./logger');

module.exports = function(req, next) {
  var deffered = Q.defer()
      , s3 = new AWS.S3(config.awsCredentials)
      , folder = req.body.folder || req.query.folder
      , checksum = req.image.checksum
      , params = {
          Bucket: config.s3.Bucket,
          Prefix: folder  + '/'
                  + checksum + '/'
        };

  s3.listObjects(params, function(err, data) {
    if (err) logger.log('error', err);
    else {
      if (data && data.Contents && data.Contents.length > 0) {
        logger.log('info', 'Image with checksum %s already uploaded', checksum);
        try {
          checkDataValidity(data.Contents);
        } catch (err) {
          logger.log('error', 'Invalid data on amazon service s3, trying to resend...');
          deffered.resolve();
        } finally {
          // this has no sense reject after deffered have been resolved if catch fires promise will be resolved
          deffered.reject();
        }
      } else {
        logger.log('info', 'No images with checksum %s', checksum);
        deffered.resolve();
      }
    }
  });

  return deffered.promise;
};
