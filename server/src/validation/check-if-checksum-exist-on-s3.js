import AWS from 'aws-sdk';
import checkDataValidity from './check-data-validity';
import checkJsonFileStructure from './check-json-file-structure';

const config = require('../../config/config.json');
const s3 = new AWS.S3();

const debug = require('debug')('stm:ims:check-if-checksum-exist-on-s3');

export default function (req) {

  const folder = req.body.folder || req.query.folder;
  const checksum = req.image.checksum;
  const prefix = `${folder}/${checksum}/`;
  const params = {
    Bucket: config.s3.Bucket,
    Prefix: prefix
  };

  return new Promise((resolve, reject) => {

    s3.listObjects(params, function (err, data) {

      if (err) {
        throw err;
      }

      if (data && data.Contents && data.Contents.length > 0) {

        debug('Image with checksum %s already uploaded', checksum);
        // debug(data.Contents);

        const { raw } = req.image;

        if (raw) {
          // debug('raw:contents', data.Contents);
          resolve();
          return;
        }

        checkJsonFileStructure(prefix)
          .then(() => checkDataValidity(data.Contents))
          .then(reject)
          .catch(err => {
            debug('error: %s', err.message);
            resolve();
          });

      } else {
        debug('No images with checksum %s', checksum);
        resolve();
      }

    });

  });

};
