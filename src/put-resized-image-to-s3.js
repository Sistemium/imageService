var AWS = require('aws-sdk')
    , config = require('./config/config.json')
    , fs = require('fs');

module.exports = function (image, name) {
  var resizedImageName = image.name.replace(/(\.jpeg|\.jpg|\.png)$/i, function (ext) {
      return name + ext;
  });
  var resizedImageStream = fs.createReadStream(image.path.replace(/(\.jpeg|\.jpg|\.png)$/i, function (ext) {
      return name + ext;
  }));

  var s3 = new AWS.S3();
  var params = {
    Bucket: 'sisdev',
    Key: resizedImageName,
    Body: resizedImageStream
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
