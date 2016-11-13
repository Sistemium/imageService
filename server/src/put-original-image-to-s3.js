const fs = require('fs');
const AWS = require('aws-sdk');
const config = require('../config/config.json');
const getFileInfo = require('./get-file-info');
const s3 = new AWS.S3(config.awsCredentials);

module.exports = function (options) {

  var image = options.image;
  var imageStream = fs.createReadStream(image.path);

  var urlData = options.dataForUrlFormation;
  var key = `${urlData.folder}/${urlData.checksum}/${options.key}.${options.extension}`;
  var fileInfo = getFileInfo(image.path);

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

  return new Promise((resolve, reject) => {

    s3.putObject(params, err => {

      if (err) {
        debug('error:', err);
        return reject(err);
      }

      resolve({
        name: config.imageInfo.original.name,
        width: fileInfo.width,
        height: fileInfo.height,
        bucketKey: key
      });

    });

  });

};
