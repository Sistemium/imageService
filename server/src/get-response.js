import _ from 'lodash';
import AWS from 'aws-sdk';

const debug = require('debug')('stm:ims:get-response');
const config = require('../config/config.json');
const imageInfo = config.imageInfo;

/**
 * @param {Array} data - array of objects with keys: ETag, Key, LastModified, Owner, Size, StorageClass
 * @param {Object} metadata - object picturesInfo: Array, object of array example: small: { bucketKey: '...', height: 11, width: 12}
 **/
function formResponse(data, metadata) {

  if (data.length <= 0) {
    throw new Error('formResponse length empty');
  }

  const splitKey = data[0].Key.split('/');
  const folder = splitKey[0];
  const name = splitKey[1];

  const imageInfoObject = {
    folder: folder,
    name: name,
    pictures: [],
  };

  _.each(imageInfo, (n, name) => {

    let existInConfig = false;

    data.forEach(item => {

      const filename = item.Key.split('/').splice(-1)[0].split('.')[0];

      if (name !== filename) {
        return;
      }

      existInConfig = true;
      // TODO: check if not type error, if is, upload new json file to s3
      const { height, width } = _.find(metadata, { name });

      imageInfoObject.pictures.push({
        name,
        height,
        width,
        src: `${config.s3.Domain + config.s3.Bucket}/${item.Key}`,
      });

    });

    if (!existInConfig) {
      throw new Error(`No such key "${name}" in config file...`)
    }

  });

  return imageInfoObject;

}

export default function (urlConfig) {

  const prefix = `${urlConfig.folder}/${urlConfig.checksum}/`;
  const s3 = new AWS.S3();
  const params = {
    Bucket: config.s3.Bucket,
    Prefix: prefix,
  };

  return new Promise((resolve, reject) => {

    s3.listObjects(params, function (err, data) {

      if (err) {
        return reject(err);
      }

      try {

        if (data && data.Contents === undefined) {
          reject(new Error(`s3.listObjects error: ${data.Contents}`));
        }

        const contents = data.Contents;
        let matchConfigFileName = false;

        //search json file

        data.Contents.forEach(function (item) {

          const fileName = item.Key.split('/').splice(-1)[0];

          if (fileName === config.picturesInfoFileName) {

            matchConfigFileName = true;
            const params = {
              Bucket: config.s3.Bucket,
              Key: prefix + config.picturesInfoFileName
            };

            s3.getObject(params, (err, data) => {

              if (err) {
                debug('Error:', err);
                return reject(err);
              }

              try {

                const metadata = JSON.parse(data.Body.toString());
                const response = formResponse(contents, metadata);

                if (!response) {
                  return reject('Empty response');
                }

                const [imgSample] = response.pictures

                debug('done:', imgSample.name, imgSample.src);
                resolve(response);

              } catch (e) {
                reject(e);
              }

            });
          }
        });

        if (!matchConfigFileName) {
          reject(new Error(`Cannot find "${config.picturesInfoFileName}"`));
        }

      } catch (err) {
        reject(err);
      }

    });

  });

};
