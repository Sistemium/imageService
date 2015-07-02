var express = require('express')
    , multer = require('multer')
    , config = require('../config/config.json')
    , putAllFilesToS3 = require('./put-all-files-to-s3')
    , notAlreadyUploaded = require('./check-if-checksum-exist-on-s3')
    , checksum = require('./generate-checksum')
    , getResponse = require('./get-response')
    , cleanupFiles = require('./cleanup')
    , app = express()
    , port = config.applicationPort
    , Q = require('q');
    
var uploadFolder = '../uploads';
app.use(multer({dest: uploadFolder}));
app.post('/', function(req, res) {
  var image = req.files.filedata;
  var deffered = Q.defer();

  checksum(image.path)
  .then(function(checksum) {
    notAlreadyUploaded(checksum)
    .then(function() {
      putAllFilesToS3(req, checksum)
      .then(function() {
        cleanupFiles(uploadFolder);
        getResponse(res, checksum);
      }, function(err) {
        console.log(err);
      });
    }, function() {
      getResponse(res, checksum);
    });
  }, function (error) {
    console.log(error);
  });
});

app.listen(port, function() {
  console.log('Server listening on port %d', port);
});
