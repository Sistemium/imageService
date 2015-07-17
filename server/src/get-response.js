var AWS = require('aws-sdk')
    , config = require('../config/config.json')
    , getFileInfo = require('./get-file-info')
    , logger = require('./logger')
    , _ = require('lodash')
    , imageInfo = config.imageInfo
    , Q = require('q');

function formResponse(data, next) {
  var imageInfoObject = {
    links: {}
  };

  try {
    _.each(imageInfo, function(n, key) {
      var existInConfig = false;
      data.forEach(function(item) {
        var filename = item.Key.split('/').splice(-1)[0].split('.')[0];
        if (key === filename) {
          existInConfig = true;
          imageInfoObject.links[key] = {
            src: config.s3.Domain + config.s3.Bucket + '/' + item.Key
          };
        }
      });
      if (!existInConfig) {
          throw new Error('No such key \"' + key + '\" in config file...')
      }
    });
  } catch (err) {
    next(err);
  }
  return imageInfoObject;
}

module.exports = function (req, res, next, dataForUrlFormation) {
  var prefix = dataForUrlFormation.folder + '/'
             + dataForUrlFormation.checksum + '/';
  var deffered = Q.defer();

  var s3 = new AWS.S3(config.awsCredentials)
      , params = {
        Bucket: config.s3.Bucket,
        Prefix: prefix
      };

  s3.listObjects(params, function(err, data) {
    if (err) {
      logger.log('error', err);
      next(err);
    } else {
      try {
        if (data && data.Contents === undefined) {
          next(new Error('data.Contents ' + data.Contents + '... Data have not been sent from amazon service s3'));
        }
        var contents = data.Contents;
        //search json file
        data.Contents.forEach(function(item) {
          var fileName = item.Key.split('/').splice(-1)[0];
          //json file name must be the same as in config
          if (fileName === config.picturesInfoFileName) {
            params = {
              Bucket: config.s3.Bucket,
              Key: prefix + config.picturesInfoFileName
            };
            //get json file with info about pictures
            s3.getObject(params, function (err, data) {
              if (err) {
                logger.log('info', 'Error occured.... %s', err);
                next(err);
              } else {
                var response = formResponse(contents, next);
                var metadata = JSON.parse(data.Body.toString());
                response.metadata = metadata;
                res.json(response);
                deffered.resolve();
                logger.log('info', 'Got response: ' + JSON.stringify(response));
              }
            });
          }
        });
    } catch (err) {
      next(err);
    }
  }
  });
  return deffered.promise;
};
