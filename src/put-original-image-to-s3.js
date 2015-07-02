var AWS = require('aws-sdk')
    , config = require('../config/config.json')
    , fs = require('fs');

module.exports = function (image, checksum) {
  var imageStream = fs.createReadStream(image.path);

  var s3 = new AWS.S3();
  var params = {
    Bucket: config.s3.Bucket,
    Key: checksum + '/' + image.name,
    Body: imageStream
  };
  s3.putObject(params, function(err, data) {
    if (err) {
      console.log(err);
    }
    else {
      console.dir(data);
    }
  });
};
