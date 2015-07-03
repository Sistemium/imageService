var crypto = require('crypto')
    , fs = require('fs')
    , Q = require('q');

module.exports = function(image) {

  var stream = fs.createReadStream(image)
      , hash = crypto.createHash('md5')
      , deffered = Q.defer();

  stream.on('data', function(data) {
    hash.update(data, 'utf8');
  });

  stream.on('end', function() {
    var checksum = hash.digest('hex');
    deffered.resolve(checksum);
  });

  stream.on('error', function(err) {
    deffered.reject(new Error(err));
  });

  return deffered.promise;
}
