var AWS = require('aws-sdk')
    , config = require('../config/config.json')
    , logger = require('./logger')
    , Q = require('q');

module.exports = function (metadata, dataForUrlFormation) {
  var key = dataForUrlFormation.folder + '/'
          + dataForUrlFormation.checksum + '/' + config.picturesInfoFileName;
  var deffered = Q.defer();
  var s3 = new AWS.S3(config.awsCredentials)
      , params = {
        Bucket: config.s3.Bucket,
        Key: key,
        Body: JSON.stringify({"picturesInfo": metadata}),
        ContentType: 'json'
      };
  s3.putObject(params, function (err, data) {
    if (err) {
      logger.log('error', 'Rejected!');
      deffered.reject(err);
    }
    else {
      logger.log('info', 'Resolved!');
      deffered.resolve(data);
    }
  });
  return deffered.promise;
};
