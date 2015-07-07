var makeImage = require('./make-image')
    , putOriginalImageToS3 = require('./put-original-image-to-s3')
    , putResizedImageToS3 = require('./put-resized-image-to-s3')
    , imageSuffixes = require('../config/config.json').imageInfo.imageSuffixes
    , Q = require('q');

module.exports = function (req, checksum, imagePath, imageName) {
  var deffered = Q.defer();
  var image = {
    path: imagePath,
    name: imageName
  };

  Q.all([
    putOriginalImageToS3(image, checksum),
    makeImage(req, checksum, imageSuffixes[0], image, putResizedImageToS3),
    makeImage(req, checksum, imageSuffixes[1], image, putResizedImageToS3),
    makeImage(req, checksum, imageSuffixes[2], image, putResizedImageToS3)
  ]).then(function () {
    deffered.resolve();
  }, function (err) {
    deffered.reject(err);
  });

  return deffered.promise;
};
