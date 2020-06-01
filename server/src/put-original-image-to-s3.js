import fs from 'fs';
import AWS from 'aws-sdk';
import getFileInfo from './get-file-info';

const config = require('../config/config.json');
const s3 = new AWS.S3();

export default function (options) {

  const { image, dataForUrlFormation: urlData } = options;
  const imageStream = fs.createReadStream(image.path);
  const key = `${urlData.folder}/${urlData.checksum}/${options.key}.${options.extension}`;
  const fileInfo = getFileInfo(image.path);

  const params = {
    Bucket: config.s3.Bucket,
    Key: key,
    Body: imageStream,
    ContentType: image.contentType,
    Metadata: {
      width: fileInfo.width.toString(),
      height: fileInfo.height.toString(),
    },
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
        bucketKey: key,
      });

    });

  });

};
