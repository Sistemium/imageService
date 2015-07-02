var express = require('express')
    , multer = require('multer')
    , config = require('../config/config.json')
    , makeImage = require('./make-image')
    , putOriginalImageToS3 = require('./put-original-image-to-s3')
    , putResizedImageToS3 = require('./put-resized-image-to-s3')
    , app = express()
    , port = config.applicationPort;

app.use(multer({dest: '../uploads'}));
app.post('/', function(req, res) {
  var image = req.files.filedata;
  putOriginalImageToS3(image);
  makeImage(req, '_medium.', putResizedImageToS3);
  makeImage(req, '_small.', putResizedImageToS3)
  makeImage(req, '_thumbnail.', putResizedImageToS3);

  res.end('\n\nDone!!!\n\n');
});

app.listen(port, function() {
  console.log('Server listening on port %d', port);
});
