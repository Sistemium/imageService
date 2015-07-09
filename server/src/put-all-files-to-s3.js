var makeImage = require('./make-image')
    , putOriginalImageToS3 = require('./put-original-image-to-s3')
    , putResizedImageToS3 = require('./put-resized-image-to-s3')
    , imageInfo = require('../config/config.json').imageInfo
    , config = require('../config/config.json')
    , fs = require('fs')
    , Q = require('q');

module.exports = function (req, checksum, image) {
  var deffered = Q.defer();
  var imageNameWithoutExt = image.name.split('.')[0];
  var imageName = image.name.replace(new RegExp(imageNameWithoutExt), config.originalName+checksum);
  var imagePath = image.path.replace(new RegExp(image.name), imageName);
  fs.renameSync(image.path, imagePath);
  image.name = imageName;
  image.path = imagePath;


  Q.all([
    putOriginalImageToS3(image, checksum),
    makeImage(req, checksum, imageInfo.smallImage.suffix, image, putResizedImageToS3),
    makeImage(req, checksum, imageInfo.mediumImage.suffix, image, putResizedImageToS3),
    makeImage(req, checksum, imageInfo.thumbnail.suffix, image, putResizedImageToS3)
  ]).then(function () {
    deffered.resolve();
  }, function (err) {
    deffered.reject(err);
  });

  return deffered.promise;
};
