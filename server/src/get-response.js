var AWS = require('aws-sdk')
    , config = require('../config/config.json')
    , getFileInfo = require('./get-file-info')
    , logger = require('./logger');

function formatResponse(data, imagesMetadata) {
  var imageInfoObject = {
    links: {}
  };
  var width = undefined
      , height = undefined
      , fileInfo = undefined
      , key = undefined;

  data.forEach(function(item) {
    var imageMetadata = undefined;

    imagesMetadata.forEach(function (metadata) {
      if (metadata.bucketKey === item.Key) imageMetadata = metadata;
    });
    var suffix = item.Key.split('/').splice(-1)[0].split('.')[0];
    logger.log('info', item);
    var imageInfo = config.imageInfo;
    switch(suffix) {
      case imageInfo.smallImage.suffix:
        width = imageMetadata.width;
        height = imageMetadata.height;
        key = "smallImage";
        break;
      case imageInfo.mediumImage.suffix:
        width = imageMetadata.width;
        height = imageMetadata.height;
        key = "mediumImage";
        break;
      case imageInfo.thumbnail.suffix:
        width = imageMetadata.width;
        height = imageMetadata.height;
        key = "thumbnail";
        break;
      case imageInfo.original.name:
        width = imageMetadata.width;
        height = imageMetadata.height;
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

module.exports = function (res, dataForUrlFormation, imagesMetadata) {
  var prefix = dataForUrlFormation.folder + '/'
             + dataForUrlFormation.org + '/'
             + dataForUrlFormation.time
             + dataForUrlFormation.checksum + '/';

  var s3 = new AWS.S3(config.awsCredentials)
      , params = {
        Bucket: config.s3.Bucket,
        Prefix: prefix
      };

  s3.listObjects(params, function(err, data) {
    if (err) {
      logger.log('error', err);
      throw new Error(err);
    } else {
      var response = formatResponse(data.Contents, imagesMetadata);
      res.json(response);
      logger.log('info', 'Got response: ' + JSON.stringify(response));
    }
  });
};
