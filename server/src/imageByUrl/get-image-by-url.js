import config from '../../config/config.json';
import request from 'request';
import fs from 'fs';
import uuid from 'uuid';
import mkdirp from 'mkdirp';

export default function (req, res, next) {

  if (!req.query.src) next(new Error('Picture link not passed!'));

  req.imageFromSrc = true;

  const folder = `${config.uploadFolderPath}/${uuid.v4()}`;
  const imageName = `${config.imageInfo.original.name}.${config.format}`;
  const imagePath = `${folder}/${imageName}`;

  mkdirp(folder, function () {

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
