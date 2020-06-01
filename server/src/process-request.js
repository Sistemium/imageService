import fs from 'fs';
import mkdirp from 'mkdirp';
import uuid from 'uuid';
import _ from 'lodash';

import config from '../config/config.json';
import checkFormat from './validation/check-format';
import putAllFilesToS3 from './put-all-files-to-s3';
import notAlreadyUploadedOrBadData from './validation/check-if-checksum-exist-on-s3';
import generateChecksum from './generate-checksum';
import getResponse from './get-response';
import cleanupFiles from './cleanup';

const debug = require('debug')('stm:ims:process-request');

export default function (req, res, next) {

  debug('Multipart file upload', req.files);
  const file = _.first(req.files);
  const folder = config.uploadFolderPath + '/' + uuid.v4();

  if (file) {

    const img = {
      path: file.path,
      //TODO: refactor s3 saver to use proper extension
      name: file.filename + '.' + file.mimetype.match(/[^/]+$/)[0],
      folder: folder
    };

    mkdirp(folder, function () {
      const writeStream = fs.createWriteStream(folder + '/' + img.name);
      req.pipe(writeStream);
      req.image = img;
      writeStream.on('finish', function () {
        checkFormatAndStartProcessing(req, res, next);
      });
    });

  } else if (req.imageFromSrc) {

    debug('image from src');
    checkFormatAndStartProcessing(req, res, next);

  } else {

    debug('Binary content request');
    const imageName = config.imageInfo.original.name + '.' + config.format;
    const imagePath = folder + '/' + imageName;

    mkdirp(folder, () => {
      req.image = {
        path: imagePath,
        name: imageName,
        folder: folder
      };
      const writeStream = fs.createWriteStream(imagePath);
      writeStream.on('finish', () => checkFormatAndStartProcessing(req, res, next));
      req.pipe(writeStream);
    });

  }
}


function getResponseAndCleanup(req, res, next) {
  const dataForUrlFormation = {
    checksum: req.image.checksum,
    folder: req.body.folder || req.query.folder
  };
  getResponse(dataForUrlFormation)
    .then(data => {
      res.json(data);
    }, next)
    .then(() => cleanupFiles(req.image.folder, req.image.name));
}


function processImage(req, res, next) {
  generateChecksum(req.image.path)
    .then(checksum => {
      req.image.checksum = checksum;
      notAlreadyUploadedOrBadData(req)
        .then(() => putAllFilesToS3(req, next)
          .then(() => getResponseAndCleanup(req, res, next))
          .catch(next))
        .catch(() => getResponseAndCleanup(req, res, next));
    })
    .catch(next);
}


function checkFormatAndStartProcessing(req, res, next) {
  checkFormat(req.image)
    .then(image => {
      debug('checkFormatAndStartProcessing start');
      processImage(req, res, next);
    })
    .catch(next);
}
