var AWS = require('aws-sdk')
    , config = require('../config/config.json')
    , logger = require('./logger');

function formatResponse(data) {
  var imageInfoObject = {
    links: {}
  };
  var width = undefined;
  var height = undefined;
  var key = undefined;

  data.forEach(function(item) {
    var suffix = item.Key.split('/').splice(-1)[0].split('.')[0];
    var imageInfo = config.imageInfo;
    switch(suffix) {
      case imageInfo.smallImage.suffix:
        width = imageInfo.smallImage.width;
        height = imageInfo.smallImage.height;
        key = "smallImage";
        break;
      case imageInfo.mediumImage.suffix:
        width = imageInfo.mediumImage.width;
        height = imageInfo.mediumImage.height;
        key = "mediumImage";
        break;
      case imageInfo.thumbnail.suffix:
        width = imageInfo.thumbnail.width;
        height = imageInfo.thumbnail.height;
        key = "thumbnail";
        break;
      case imageInfo.original.name:
        // todo: write original image width and height
        width = null;
        height = null;
        key = "original";
        imageInfoObject.original = {
          src: config.s3.Domain + config.s3.Bucket + '/' + item.Key
        };
        break;
      default: throw new Error('No such key...');
    }
    imageInfoObject.links[key] = {
        src: config.s3.Domain + config.s3.Bucket + '/' + item.Key,
        width: width,
        height: height
    };
  });

  return imageInfoObject;
};

module.exports = function (res, checksum) {
  var s3 = new AWS.S3(config.awsCredentials)
      , params = {
        Bucket: config.s3.Bucket,
        Prefix: checksum + '/'
      };

  s3.listObjects(params, function(err, data) {
    if (err) {
      logger.log('error', err);
      throw new Error(err);
    } else {
      var response = formatResponse(data.Contents);
      res.json(response);
      logger.log('info', 'Got response: ' + JSON.stringify(response));
    }
  });
};
