var AWS = require('aws-sdk')
    , fs = require('fs')
    , config = require('../config/config.json')
    , getFileInfo = require('./get-file-info')
    , logger = require('./logger');

module.exports = function (options, deffered) {
  var image = options.image || {}
      , dataForUrlFormation = options.dataForUrlFormation || {}
      , name = options.imageInfo.suffix || '';

  var imageName = image.name.replace(new RegExp(config.imageInfo.original.name+dataForUrlFormation.checksum), '')
      , resizedImageName = imageName.replace(/(\.jpeg|\.jpg|\.png)$/i, function (ext) {
          return name + ext;
        })
      , resizedImageStream = fs.createReadStream(image.path.replace(/(\.jpeg|\.jpg|\.png)$/i, function (ext) {
          return name + ext;
        }))
      , key = dataForUrlFormation.folder + '/'
            + dataForUrlFormation.checksum + '/'
            + resizedImageName;

  var filePath = image.path.replace(/(\.jpeg|\.jpg|\.png)$/i, function (ext) {
          return name + ext;
        });
  var fileInfo = getFileInfo(filePath);
  var s3 = new AWS.S3(config.awsCredentials);
  var params = {
    Bucket: config.s3.Bucket,
    Key: key,
    Body: resizedImageStream,
    ContentType: image.contentType,
    Metadata: {
      'width': fileInfo.width.toString(),
      'height': fileInfo.height.toString()
    }
  };
  s3.putObject(params, function(err, data) {
    if (err) {
      logger.log('error', err);
      deffered.reject(err);
    }
    else {
      data[name] = {
        width: fileInfo.width,
        height: fileInfo.height,
        bucketKey: key
      };

      deffered.resolve(data);
    }
  });
};
