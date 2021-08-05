import fs from 'fs';
import pick from 'lodash/pick'
import AWS from 'aws-sdk';
import getFileInfo from './get-file-info';

const config = require('../config/config.json');
const s3 = new AWS.S3();

export default function (options) {

  const { image, dataForUrlFormation: urlData, raw } = options;
  const imageStream = fs.createReadStream(image.path);
  const name = raw ? `file.${raw.ext}` : `${options.key}.${options.extension}`;
  const key = `${urlData.folder}/${urlData.checksum}/${name}`;
  const fileInfo = raw || getFileInfo(image.path);

  const params = {
    Bucket: config.s3.Bucket,
    Key: key,
    Body: imageStream,
    ContentType: raw ? raw.mime : image.contentType,
    Metadata: raw ? {} : {
      width: fileInfo.width.toString(),
      height: fileInfo.height.toString(),
    },
  };

  return new Promise((resolve, reject) => {

    s3.putObject(params, err => {

      if (err) {
        // debug('error:', err);
        return reject(err);
      }

      resolve({
        name: config.imageInfo.original.name,
        bucketKey: key,
        ...(raw ? {} : pick(fileInfo, ['width', 'height'])),
      });

    });

  });

};
