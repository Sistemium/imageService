const AWS = require('aws-sdk');
const fs = require('fs');
const config = require('../config/config.json');
const getFileInfo = require('./get-file-info');
const debug = require('debug')('stm:ims:put-resized-image-to-s3');
const s3 = new AWS.S3(config.awsCredentials);
const format = config.format;

module.exports = function (options) {

  var image = options.image || {};
  var dataForUrlFormation = options.dataForUrlFormation || {};
  var name = options.key;

  var resizedImageStream = fs.createReadStream(image.path.replace(/(\.jpeg|\.jpg|\.png)$/i, function (ext) {
    return name + ext;
  }));

  var key = `${dataForUrlFormation.folder}/${dataForUrlFormation.checksum}/${options.key}.${format}`;

  var filePath = image.path.replace(/(\.jpeg|\.jpg|\.png)$/i, function (ext) {
    return name + ext;
  });
  var fileInfo = getFileInfo(filePath);

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

  return new Promise((resolve, reject) => {
    s3.putObject(params, function (err) {

      if (err) {
        debug('putObject error:', err);
        return reject(err);
      }

      resolve({
        name: name,
        width: fileInfo.width,
        height: fileInfo.height,
        bucketKey: key
      });

    });
  });

};
