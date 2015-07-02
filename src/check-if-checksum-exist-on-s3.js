var AWS = require('aws-sdk')
    , config = require('../config/config.json')
    , Q = require('q');

module.exports = function(checksum) {
  var deffered = Q.defer()
      , s3 = new AWS.S3()
      , params = {
          Bucket: config.s3.Bucket,
          Prefix: checksum + '/'
        };

  s3.listObjects(params, function(err, data) {
    if (err) console.log(err);
    else {
      if (data.Contents.length > 0) {
        console.log('Image with checksum %s already uploaded', checksum);
        deffered.reject();
      } else {
        console.log('No images with checksum %s', checksum);
        deffered.resolve();
      }
    }
  });

  return deffered.promise;
};
