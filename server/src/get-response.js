var AWS = require('aws-sdk')
    , config = require('../config/config.json')
    , getFileInfo = require('./get-file-info')
    , logger = require('./logger');

function formResponse(data) {
  var imageInfoObject = {
    links: {}
  };
  var width = undefined
      , height = undefined
      , fileInfo = undefined
      , key = undefined;

  data.forEach(function(item) {
    var fileName = item.Key.split('/').splice(-1)[0];
    var suffix = fileName.split('.')[0];
    var imageInfo = config.imageInfo;
    switch(suffix) {
      case imageInfo.smallImage.suffix:
        key = "smallImage";
        break;
      case imageInfo.mediumImage.suffix:
        key = "mediumImage";
        break;
      case imageInfo.thumbnail.suffix:
        key = "thumbnail";
        break;
      case config.picturesInfoFileName.split('.')[0]:
        key = "imageInfoJsonFile"
        break;
      case imageInfo.original.name:
        key = "original";
        break;
      default: throw new Error('No such key...');
    }
    imageInfoObject.links[key] = {
        src: config.s3.Domain + config.s3.Bucket + '/' + item.Key
    };
  });

  return imageInfoObject;
};

module.exports = function (res, dataForUrlFormation) {
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
      var contents = data.Contents;
      data.Contents.forEach(function(item) {
        var fileName = item.Key.split('/').splice(-1)[0];
        if (fileName === config.picturesInfoFileName) {
          params = {
            Bucket: config.s3.Bucket,
            Key: prefix + config.picturesInfoFileName
          };
          s3.getObject(params, function (err, data) {
            if (err) {
              logger.log('info', 'Error occured.... %s', err);
              throw new Error(err);
            } else {
              var response = formResponse(contents);
              var metadata = JSON.parse(data.Body.toString());
              response.metadata = metadata;
              res.json(response);
              logger.log('info', 'Got response: ' + JSON.stringify(response));
            }
          });
        }
      });
    }
  });
};
