var makeImage = require('./make-image')
    , putOriginalImageToS3 = require('./put-original-image-to-s3')
    , putResizedImageToS3 = require('./put-resized-image-to-s3')
    , Q = require('q');

module.exports = function (req, checksum, imagePath, imageName) {
  var deffered = Q.defer();
  var image = {
    path: imagePath,
    name: imageName
  };

  Q.all([
    putOriginalImageToS3(image, checksum),
    makeImage(req, checksum, '_medium.', image, putResizedImageToS3),
    makeImage(req, checksum, '_small.', image, putResizedImageToS3),
    makeImage(req, checksum, '_thumbnail.', image, putResizedImageToS3)
  ]).then(function () {
    deffered.resolve();
  }, function (err) {
    deffered.reject(err);
  });

  return deffered.promise;
};
