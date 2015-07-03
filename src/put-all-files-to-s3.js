var makeImage = require('./make-image')
    , putOriginalImageToS3 = require('./put-original-image-to-s3')
    , putResizedImageToS3 = require('./put-resized-image-to-s3')
    , Q = require('q');

module.exports = function (req, checksum) {
  var image = req.files.filedata;
  var deffered = Q.defer();

  Q.all([
    putOriginalImageToS3(image, checksum),
    makeImage(req, checksum, '_medium.', putResizedImageToS3),
    makeImage(req, checksum, '_small.', putResizedImageToS3),
    makeImage(req, checksum, '_thumbnail.', putResizedImageToS3)
  ]).then(function () {
    deffered.resolve();
  }, function (err) {
    deffered.reject(err);
  });

  return deffered.promise;
};
