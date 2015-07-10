var AWS = require('aws-sdk')
    , fs = require('fs')
    , config = require('../config/config.json')
    , logger = require('./logger');

module.exports = function (image, dataForUrlFormation, name, deffered) {
  logger.log('info', image);
  var imageName = image.name.replace(new RegExp(config.imageInfo.original.name+checksum), '')
      , resizedImageName = imageName.replace(/(\.jpeg|\.jpg|\.png)$/i, function (ext) {
          return name + ext;
        })
      , resizedImageStream = fs.createReadStream(image.path.replace(/(\.jpeg|\.jpg|\.png)$/i, function (ext) {
          return name + ext;
        }))
      , key = dataForUrlFormation.folder + '/'
            + dataForUrlFormation.org + '/'
            + dataForUrlFormation.time
            + dataForUrlFormation.checksum + '/'
            + resizedImageName;

  var s3 = new AWS.S3(config.awsCredentials);
  var params = {
    Bucket: config.s3.Bucket,
    Key: key,
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
