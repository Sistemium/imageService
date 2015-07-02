var makeImage = require('./make-image')
    , putOriginalImageToS3 = require('./put-original-image-to-s3')
    , putResizedImageToS3 = require('./put-resized-image-to-s3')
    , async = require('async')
    , Q = require('q');

module.exports = function (req, checksum) {
  var image = req.files.filedata;
  var deffered = Q.defer();
  async.waterfall([
    putOriginalImageToS3(image, checksum),
    makeImage(req, checksum, '_medium.', putResizedImageToS3),
    makeImage(req, checksum, '_small.', putResizedImageToS3),
    makeImage(req, checksum, '_thumbnail.', putResizedImageToS3)
  ], function(err, result){
      if (err){
        console.log(err);
        deffered.reject(err);
      }
      else {
        console.log(result);
        deffered.resolve(result);
      }
  });

  return deffered.promise;
};
