const fs = require('fs');
const _ = require('lodash');
const makeImage = require('./make-image');
const putOriginalImageToS3 = require('./put-original-image-to-s3');
const putResizedImageToS3 = require('./put-resized-image-to-s3');
const putJSONWithPicturesInfo = require('./put-json-to-s3-with-pictures-info');
const config = require('../config/config.json');
const imageInfo = config.imageInfo;

const debug = require('debug')('stm:ims:put-all-files-to-s3');

function makeImageAndPutToS3(req, next, options) {
  var promises = [];
  try {
    _.each(imageInfo, function(n, key) {
      options.key = key;
      if (key === 'original') {
        promises.push(putOriginalImageToS3(options));
      } else {
        options.imageInfo = n;
        options.image.contentType = config.contentTypeFor[config.format];
        promises.push(makeImage(req, options).then(putResizedImageToS3));
      }
    });
  } catch (err) {
    next(err);
  }
  return promises;
}

module.exports = function(req, next) {

  var image = req.image;
  var folder = req.body.folder || req.query.folder;
  var checksum = image.checksum;
  var imageNameWithoutExt = image.name.split('.')[0];
  var imageName = image.name.replace(new RegExp(imageNameWithoutExt), checksum);
  var imagePath = image.folder + '/' + imageName;
  var dataForUrlFormation = {
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

  return Promise.all(makeImageAndPutToS3(req, next, options))
    .then(data => putJSONWithPicturesInfo(data, dataForUrlFormation)
      .then(data => {
        debug('Data is put to s3:', data);
        return data;
      })
    );

};
