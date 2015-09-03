'use strict';

var makeImage = require('./make-image')
    , putOriginalImageToS3 = require('./put-original-image-to-s3')
    , putResizedImageToS3 = require('./put-resized-image-to-s3')
    , imageInfo = require('../config/config.json').imageInfo
    , config = require('../config/config.json')
    , putJSONWithPicturesInfo = require('./put-json-to-s3-with-pictures-info')
    , fs = require('fs')
    , Q = require('q')
    , _ = require('lodash');

function makeImageAndPutToS3(req, next, options, cb) {
  var promises = [];
  try {
    _.each(imageInfo, function(n, key) {
      options.key = key;
      if (key === 'original') {
        promises.push(putOriginalImageToS3(options));
      } else {
        options.imageInfo = n;
        promises.push(makeImage(req, options, cb));
      }
    });
  } catch (err) {
    next(err);
  }
  return promises;
}

module.exports = function (req, next) {
  var timestamp = Date.now();
  var deffered = Q.defer()
      , image = req.image
      , folder = req.body.folder || req.query.folder
      , checksum = image.checksum
      , imageNameWithoutExt = image.name.split('.')[0]
      , imageName = image.name.replace(new RegExp(imageNameWithoutExt), config.imageInfo.original.name+checksum)
      , imagePath = image.path.replace(new RegExp(image.name), imageName)
      , dataForUrlFormation = {
          checksum: checksum,
          folder: folder
      };

  fs.renameSync(image.path, imagePath);
  image.name = imageName;
  image.path = imagePath;

  var options = {
    dataForUrlFormation: dataForUrlFormation,
    image: image,
    extension: image.name.split('.')[image.name.split('.').length - 1]
  };

  Q.all(makeImageAndPutToS3(req, next, options, putResizedImageToS3))
  .then(function (data) {
    putJSONWithPicturesInfo(data, dataForUrlFormation)
    .then(function(data) {
      timestamp = Date.now();
      console.log(timestamp + ' info: Data is put on s3: %s', data);
      deffered.resolve(data);
    }, function(err) {
      timestamp = Date.now();
      console.log(timestamp + ' error: Error occured %s', err);
      deffered.reject(err);
    });
  }, function (err) {
    timestamp = Date.now();
    console.log(timestamp + ' error: Error occured %s', err);
    deffered.reject(err);
  });

  return deffered.promise;
};
