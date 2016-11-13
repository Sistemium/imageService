const AWS = require('aws-sdk');
const config = require('../../config/config.json');
const checkDataValidity = require('./check-data-validity');
const checkJsonFileStructure = require('./check-json-file-structure');
const s3 = new AWS.S3(config.awsCredentials);

const debug = require('debug')('stm:ims:check-if-checksum-exist-on-s3');

module.exports = function(req) {

  var folder = req.body.folder || req.query.folder;
  var checksum = req.image.checksum;
  var prefix = `${folder}/${checksum}/`;
  var params = {
    Bucket: config.s3.Bucket,
    Prefix: prefix
  };

  return new Promise((resolve, reject) => {

    s3.listObjects(params, function(err, data) {

      if (err) {
        throw err;
      }

      if (data && data.Contents && data.Contents.length > 0) {

        debug('Image with checksum %s already uploaded', checksum);

        checkJsonFileStructure(prefix)
          .then(() => checkDataValidity(data.Contents))
          .then(reject)
          .catch(err => {
            debug('error: %s', err);
            resolve();
          });

      } else {
        debug('No images with checksum %s', checksum);
        resolve();
      }

    });

  });

};
