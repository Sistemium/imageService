var config = require('../config/config.json')
    , imageInfo = config.imageInfo
    , _ = require('lodash');

module.exports = function (data, next) {
  var counter = 0;
  // check that
  _.each(imageInfo, function (item, key) {
    data.forEach(function (objFromS3) {
      var filename = objFromS3.Key.split('/').splice(-1)[0];
      if (filename === key) {
        counter++;
      }
    })
  });

  if (counter !== imageInfo.length) {
     throw new Error('Count of configured images, does not match count of images on s3');
  }
}
