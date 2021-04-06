import config from '../../config/config.json';
import request from 'request';
import fs from 'fs';
import uuid from 'uuid';
import mkdirp from 'mkdirp';

const debug = require('debug')('stm:ims:get-image-by-url');

export default function (req, res, next) {

  if (!req.query.src) {

    debug(req.query);

    next(new Error('Picture link not passed!'));
    return;
  }

  req.imageFromSrc = true;

  const folder = `${config.uploadFolderPath}/${uuid.v4()}`;
  const imageName = `${config.imageInfo.original.name}.${config.format}`;
  const imagePath = `${folder}/${imageName}`;

  mkdirp(folder).then(() => {

    req.image = {
      path: imagePath,
      name: imageName,
      folder: folder,
    };

    request(req.query.src)
      .pipe(fs.createWriteStream(imagePath))
      .on('finish', () => {
        next();
      })
      .on('error', next);

  });

}
