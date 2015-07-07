var AWS = require('aws-sdk')
    , config = require('../config/config.json')
    , fs = require('fs')
    , Q = require('q')
    , logger = require('./logger');

module.exports = function (image, checksum) {
  var imageStream = fs.createReadStream(image.path);
  var deffered = Q.defer();

  var s3 = new AWS.S3();
  var params = {
    Bucket: config.s3.Bucket,
    Key: checksum + '/' + image.name,
    Body: imageStream
  };
  s3.putObject(params, function(err, data) {
    if (err) {
      logger.log('error', err)
      deffered.reject(err);
    }
    else {
      logger.log('info', JSON.stringify(data));
      deffered.resolve(data);
    }
  });

  return deffered.promise;
};
