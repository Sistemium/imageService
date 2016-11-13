const AWS = require('aws-sdk');
const config = require('../config/config.json');
const _ = require('lodash');
const imageInfo = config.imageInfo;
const debug = require('debug')('stm:ims:get-response');

/**
 * @param {Array} data - array of objects with keys: ETag, Key, LastModified, Owner, Size, StorageClass
 * @param {Object} metadata - object picturesInfo: Array, object of array example: small: { bucketKey: '...', height: 11, width: 12}
 **/
function formResponse(data, metadata) {

  if (data.length <= 0) {
    throw new Error('formResponse length empty');
  }

  var splitedKey = data[0].Key.split('/');
  var folder = splitedKey[0];
  var name = splitedKey[1];

  var imageInfoObject = {
    folder: folder,
    name: name,
    pictures: []
  };

  _.each(imageInfo, function (n, key) {

    var existInConfig = false;

    data.forEach(function (item) {
      var filename = item.Key.split('/').splice(-1)[0].split('.')[0];
      if (key === filename) {
        existInConfig = true;
        // TODO: check if not type error, if is, upload new json file to s3
        var searchMetadata = _.find(metadata, {
          name: key
        });
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

  return imageInfoObject;

}

module.exports = function (urlConfig) {

  var prefix = `${urlConfig.folder}/${urlConfig.checksum}/`;
  var s3 = new AWS.S3(config.awsCredentials);
  var params = {
    Bucket: config.s3.Bucket,
    Prefix: prefix
  };

  return new Promise((resolve, reject) => {

    s3.listObjects(params, function (err, data) {

      if (err) {
        return reject(err);
      }

      try {

        if (data && data.Contents === undefined) {
          reject(new Error(`s3.listObjects error: ${data.Contents}`));
        }

        var contents = data.Contents;
        var matchConfigFileName = false;

        //search json file

        data.Contents.forEach(function (item) {

          var fileName = item.Key.split('/').splice(-1)[0];

          if (fileName === config.picturesInfoFileName) {

            matchConfigFileName = true;
            var params = {
              Bucket: config.s3.Bucket,
              Key: prefix + config.picturesInfoFileName
            };

            s3.getObject(params, (err, data) => {

              if (err) {
                debug('Error:', err);
                return reject(err);
              }

              try {

                var metadata = JSON.parse(data.Body.toString());
                var response = formResponse(contents, metadata);

                if (!response) {
                  return reject('Empty response');
                }

                debug('Will respond:', response);
                resolve(response);

              } catch (e) {
                reject(e);
              }

            });
          }
        });

        if (!matchConfigFileName) {
          reject(new Error(`Cannot find "${config.picturesInfoFileName}"`));
        }

      } catch (err) {
        reject(err);
      }

    });

  });

};
