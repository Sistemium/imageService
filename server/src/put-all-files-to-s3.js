import fs from 'fs';
import _ from 'lodash';
import makeImage from './make-image';
import putOriginalImageToS3 from './put-original-image-to-s3';
import putResizedImageToS3 from './put-resized-image-to-s3';
import putJSONWithPicturesInfo from './put-json-to-s3-with-pictures-info';

const config = require('../config/config.json');
const imageInfo = config.imageInfo;

const debug = require('debug')('stm:ims:put-all-files-to-s3');

function makeImageAndPutToS3(req, next, options) {
  const promises = [];
  try {

    const { image } = req;

    if (image.raw) {
      const { filename, raw } = image;
      return [putOriginalImageToS3({ ...options, raw, filename })];
    }

    _.each(imageInfo, function (n, key) {
      options.key = key;
      if (key === 'original') {
        promises.push(putOriginalImageToS3(options));
      } else {
        options.imageInfo = n;
        options.image.contentType = config.contentTypeFor[config.format];
        promises.push(makeImage(req, options).then(putResizedImageToS3));
      }
    });
  } catch (err) {
    next(err);
  }
  return promises;
}

export default function (req, next) {

  const { image } = req;
  const folder = req.body.folder || req.query.folder;
  const { checksum } = image;
  const imageNameWithoutExt = image.name.split('.')[0];
  const imageName = image.name.replace(new RegExp(imageNameWithoutExt), checksum);
  const imagePath = `${image.folder}/${imageName}`;
  const dataForUrlFormation = {
    checksum: checksum,
    folder: folder,
  };

  fs.renameSync(image.path, imagePath);
  image.name = imageName;
  image.path = imagePath;

  const options = {
    image,
    dataForUrlFormation,
    trim: !!req.query.trim,
    extension: image.name.split('.')[image.name.split('.').length - 1],
  };

  return Promise.all(makeImageAndPutToS3(req, next, options))
    .then(data => putJSONWithPicturesInfo(data, dataForUrlFormation)
      .then(data => {
        debug('Data is put to s3:', data);
        return data;
      })
    );

};
