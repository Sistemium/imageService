var AWS = require('aws-sdk')
    , config = require('../config/config.json')
    , logger = require('./logger');

function formatResponse(data) {
  var imageLinks = data.map(function(item) {
    return  config.s3.Domain + config.s3.Bucket + '/' + item.Key;
  });
  return {
    pictures: imageLinks
  };
};

module.exports = function (res, checksum) {
  var s3 = new AWS.S3()
      , params = {
        Bucket: config.s3.Bucket,
        Prefix: checksum + '/'
      };

  s3.listObjects(params, function(err, data) {
    if (err) logger.log('error', err);
    else {
      var response = formatResponse(data.Contents);
      res.json(response);
      logger.log('info', 'Got response: ' + JSON.stringify(response));
    }
  });
};
