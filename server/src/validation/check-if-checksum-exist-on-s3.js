'use strict';

var AWS = require('aws-sdk')
    , config = require('../../config/config.json')
    , checkDataValidity = require('./check-data-validity')
    , checkJsonFileStructure = require('./check-json-file-structure')
    , Q = require('q');

module.exports = function(req) {
  var timestamp = Date.now();
  var deffered = Q.defer()
      , s3 = new AWS.S3(config.awsCredentials)
      , folder = req.body.folder || req.query.folder
      , checksum = req.image.checksum
      , prefix = folder + '/' + checksum + '/'
      , params = {
          Bucket: config.s3.Bucket,
          Prefix: prefix
        };

  s3.listObjects(params, function(err, data) {
    if (err) {
        timestamp = Date.now();
        console.log(timestamp + ' error: %s', err);
    }
    else {
      if (data && data.Contents && data.Contents.length > 0) {
        timestamp = Date.now();
        console.log(timestamp + ' info: Image with checksum %s already uploaded', checksum);
        checkJsonFileStructure(prefix)
        .then(function () {
            try {
                checkDataValidity(data.Contents);
            }
            catch (err) {
                timestamp = Date.now();
                console.log(timestamp + ' error: Invalid data on amazon service s3, trying to resend...');
                deffered.resolve();
            } finally {
                // this has no sense reject after deffered have been resolved if catch fires promise will be resolved
                deffered.reject();
            }
        }, function (err) {
            timestamp = Date.now();
            console.log(timestamp + ' error: %s', err);
            deffered.resolve();
        });
      } else {
        timestamp = Date.now();
        console.log(timestamp + ' info: No images with checksum %s', checksum);
        deffered.resolve();
      }
    }
  });

  return deffered.promise;
};
