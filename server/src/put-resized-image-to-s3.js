import AWS from 'aws-sdk';
import getFileInfo from './get-file-info';
// import fs from 'fs';

const config = require('../config/config.json');
const debug = require('debug')('stm:ims:put-resized-image-to-s3');
const s3 = new AWS.S3();
const format = config.format;

export default function (options) {

  const { image = {}, key: name, dataForUrlFormation = {}, metadata } = options;

  const newPath = image.path.replace(/(\.jpeg|\.jpg|\.png)$/i, ext => name + ext)
  // const resizedImageStream = fs.createReadStream(newPath);
  const key = `${dataForUrlFormation.folder}/${dataForUrlFormation.checksum}/${options.key}.${format}`;

  const params = {
    Bucket: config.s3.Bucket,
    Key: key,
    Body: options.buffer,
    ContentType: image.contentType,
    Metadata: {
      width: metadata.width.toString(),
      height: metadata.height.toString(),
    },
  };

  return new Promise((resolve, reject) => {
    s3.putObject(params, function (err) {

      if (err) {
        debug('putObject error:', err);
        return reject(err);
      }

      resolve({
        name: name,
        width: metadata.width,
        height: metadata.height,
        bucketKey: key,
      });

    });
  });

};
