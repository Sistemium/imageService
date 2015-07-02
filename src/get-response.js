var AWS = require('aws-sdk')
    , config = require('../config/config.json');

module.exports = function (res, checksum) {
  var s3 = new AWS.S3()
      , params = {
        Bucket: config.s3.Bucket,
        Prefix: checksum + '/'
      };

  s3.listObjects(params, function(err, data) {
    if (err) console.log(err);
    else {
      console.dir(data);
      res.end('\nDone!!\n');
    }
  });
};
