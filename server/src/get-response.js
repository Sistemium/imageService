var AWS = require('aws-sdk')
    , config = require('../config/config.json')
    , getFileInfo = require('./get-file-info')
    , logger = require('./logger')
    , _ = require('lodash')
    , imageInfo = config.imageInfo
    , Q = require('q');

/**
 * @param {Array} data - array of objects with keys: ETag, Key, LastModified, Owner, Size, StorageClass
 * @param {Object} metadata - object picturesInfo: Array, object of array example: small: { bucketKey: '...', height: 11, width: 12}
 * @param {Function} next
 **/
function formResponse(data, metadata, next) {
  if (data.length > 0) {
    var splitedKey = data[0].Key.split('/');
    var folder = splitedKey[0];
    var name = splitedKey[1];

    var imageInfoObject = {
      folder: folder,
      name: name,
      pictures: []
    };

    try {
      _.each(imageInfo, function (n, key) {
        var existInConfig = false;
        data.forEach(function (item) {
          var filename = item.Key.split('/').splice(-1)[0].split('.')[0];
          if (key === filename) {
            existInConfig = true;
            // TODO: check if not type error, if is, upload new json file to s3
            var searchMetadata = _.findWhere(metadata, {name: key});
            imageInfoObject.pictures.push({
              name: key,
              src: config.s3.Domain + config.s3.Bucket + '/' + item.Key,
              height: searchMetadata.height,
              width: searchMetadata.width
            });
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
        var matchConfigFileName = false;
        //search json file
        data.Contents.forEach(function(item) {
          var fileName = item.Key.split('/').splice(-1)[0];
          //json file name must be the same as in config
          if (fileName === config.picturesInfoFileName) {
            matchConfigFileName = true;
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
                var metadata = JSON.parse(data.Body.toString());
                var response = formResponse(contents, metadata, next);
                res.json(response);
                deffered.resolve();
                logger.log('info', 'Got response: ' + JSON.stringify(response));
              }
            });
          }
        });
        if (!matchConfigFileName) {
          throw new Error('Cannot find \"' + config.picturesInfoFileName + '\"');
        }
    } catch (err) {
      next(err);
    }
  }
  });
  return deffered.promise;
};
