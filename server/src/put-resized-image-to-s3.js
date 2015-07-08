var AWS = require('aws-sdk')
    , fs = require('fs')
    , config = require('../config/config.json')
    , logger = require('./logger');

module.exports = function (image, checksum, name, deffered) {
  logger.log('info', image);
  var imageName = image.name.replace(new RegExp(config.orignalName), '');
  var resizedImageName = imageName.replace(/(\.jpeg|\.jpg|\.png)$/i, function (ext) {
      return name + ext;
  });
  var resizedImageStream = fs.createReadStream(image.path.replace(/(\.jpeg|\.jpg|\.png)$/i, function (ext) {
      return name + ext;
  }));

  var s3 = new AWS.S3();
  var params = {
    Bucket: config.s3.Bucket,
    Key: checksum + '/' + resizedImageName,
    Body: resizedImageStream,
    ContentType: image.contentType
  };
  s3.putObject(params, function(err, data) {
    if (err) {
      logger.log('error', err);
      deffered.reject(err);
    }
    else {
      logger.log('info', JSON.stringify(data));
      deffered.resolve(data);
    }
  });
};
