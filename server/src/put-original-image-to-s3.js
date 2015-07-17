var AWS = require('aws-sdk')
    , config = require('../config/config.json')
    , fs = require('fs')
    , Q = require('q')
    , getFileInfo = require('./get-file-info')
    , logger = require('./logger');

module.exports = function (options) {

  var image = options.image
    , imageStream = fs.createReadStream(image.path)
    , deffered = Q.defer()
    , dataForUrlFormation = options.dataForUrlFormation
    , key = dataForUrlFormation.folder + '/'
          + dataForUrlFormation.checksum + '/'
          + options.key + '.' + options.extension;

  var fileInfo = getFileInfo(image.path);
  var s3 = new AWS.S3(config.awsCredentials);
  var params = {
    Bucket: config.s3.Bucket,
    Key: key,
    Body: imageStream,
    ContentType: image.contentType,
    Metadata: {
      'width': fileInfo.width.toString(),
      'height': fileInfo.height.toString()
    }
  };
  s3.putObject(params, function(err, data) {
    if (err) {
      logger.log('error', err)
      deffered.reject(err);
    }
    else {
      data.original = {
        width: fileInfo.width,
        height: fileInfo.height,
        bucketKey: key
      }
      deffered.resolve(data);
    }
  });

  return deffered.promise;
};
