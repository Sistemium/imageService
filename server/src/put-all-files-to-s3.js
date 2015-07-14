var makeImage = require('./make-image')
    , putOriginalImageToS3 = require('./put-original-image-to-s3')
    , putResizedImageToS3 = require('./put-resized-image-to-s3')
    , imageInfo = require('../config/config.json').imageInfo
    , config = require('../config/config.json')
    , logger = require('./logger')
    , putJSONWithPicturesInfo = require('./put-json-to-s3-with-pictures-info')
    , fs = require('fs')
    , Q = require('q');

module.exports = function (req, checksum, image, body) {
  var deffered = Q.defer();
  var imageNameWithoutExt = image.name.split('.')[0];
  var imageName = image.name.replace(new RegExp(imageNameWithoutExt), config.imageInfo.original.name+checksum);
  var imagePath = image.path.replace(new RegExp(image.name), imageName);
  fs.renameSync(image.path, imagePath);
  image.name = imageName;
  image.path = imagePath;
  var dataForUrlFormation = {
    checksum: checksum,
    folder: body.folder
  };

  Q.all([
    putOriginalImageToS3(image, dataForUrlFormation),
    makeImage(req, dataForUrlFormation, imageInfo.smallImage.suffix, image, putResizedImageToS3),
    makeImage(req, dataForUrlFormation, imageInfo.mediumImage.suffix, image, putResizedImageToS3),
    makeImage(req, dataForUrlFormation, imageInfo.thumbnail.suffix, image, putResizedImageToS3)
  ]).then(function (data) {
    putJSONWithPicturesInfo(data, dataForUrlFormation)
    .then(function(data) {
      logger.log('info', 'Data was putted on s3: %s', data);
      deffered.resolve(data);
    }, function(err) {
      logger.log('error', 'Error occured %s', err);
      deffered.reject(err);
    });
  }, function (err) {
    logger.log('error', 'Error occured %s', err);
    deffered.reject(err);
  });

  return deffered.promise;
};
