'use strict';

var AWS = require('aws-sdk')
    , config = require('../config/config.json')
    , Q = require('q');

module.exports = function (metadata, dataForUrlFormation) {
  var timestamp = Date.now();
  var key = dataForUrlFormation.folder + '/'
          + dataForUrlFormation.checksum + '/' + config.picturesInfoFileName;
  var deffered = Q.defer();
  var s3 = new AWS.S3(config.awsCredentials)
      , params = {
        Bucket: config.s3.Bucket,
        Key: key,
        Body: JSON.stringify(metadata),
        ContentType: 'json'
      };
  s3.putObject(params, function (err, data) {
    if (err) {
      timestamp = Date.now();
      console.log(timestamp + ' error: Rejected!');
      deffered.reject(err);
    }
    else {
      timestamp = Date.now();
      console.log(timestamp + ' info: Resolved!');
      deffered.resolve(data);
    }
  });
  return deffered.promise;
};
