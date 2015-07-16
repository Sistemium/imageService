var makeImage = require('./make-image')
    , putOriginalImageToS3 = require('./put-original-image-to-s3')
    , putResizedImageToS3 = require('./put-resized-image-to-s3')
    , imageInfo = require('../config/config.json').imageInfo
    , config = require('../config/config.json')
    , logger = require('./logger')
    , putJSONWithPicturesInfo = require('./put-json-to-s3-with-pictures-info')
    , fs = require('fs')
    , Q = require('q')
    , _ = require('lodash');

module.exports = function (req, checksum) {
  var deffered = Q.defer()
      , image = req.image
      , body = req.body
      , imageNameWithoutExt = image.name.split('.')[0]
      , imageName = image.name.replace(new RegExp(imageNameWithoutExt), config.imageInfo.original.name+checksum)
      , imagePath = image.path.replace(new RegExp(image.name), imageName)
      , dataForUrlFormation = {
          checksum: checksum,
          folder: body.folder
      }
      , promises = [];

  fs.renameSync(image.path, imagePath);
  image.name = imageName;
  image.path = imagePath;

  function makeImageAndPutToS3(req, options, cb) {
    _.each(imageInfo, function(n, key) {
      if (key === 'original') {
        promises.push(putOriginalImageToS3(options.image, options.dataForUrlFormation));
      } else {
        options.imageInfo = n;
        promises.push(makeImage(req, options, cb));
      }
    });
    return promises;
  }

  var options = {
    dataForUrlFormation: dataForUrlFormation,
    image: image
  };

  Q.all(makeImageAndPutToS3(req, options, putResizedImageToS3))
  .then(function (data) {
    putJSONWithPicturesInfo(data, dataForUrlFormation)
    .then(function(data) {
      logger.log('info', 'Data is put on s3: ', data);
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
