var AWS = require('aws-sdk')
    , config = require('../config/config.json')
    , fs = require('fs')
    , Q = require('q')
    , logger = require('./logger');

module.exports = function (image, dataForUrlFormation) {
  var imageStream = fs.createReadStream(image.path)
      , deffered = Q.defer()
      , key = dataForUrlFormation.folder + '/'
            + dataForUrlFormation.org + '/'
            + dataForUrlFormation.time
            + dataForUrlFormation.checksum + '/'
            + image.name.replace(new RegExp(dataForUrlFormation.checksum), '');

  var s3 = new AWS.S3(config.awsCredentials);
  var params = {
    Bucket: config.s3.Bucket,
    Key: key,
    Body: imageStream,
    ContentType: image.contentType
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
