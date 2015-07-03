var express = require('express')
    , multer = require('multer')
    , config = require('../config/config.json')
    , processRequest = require('./process-request')
    , app = express()
    , port = config.applicationPort;

app.use(multer({dest: config.uploadFolderPath}), processRequest());
app.post('/', function () {});

app.listen(port, function() {
  console.log('Server listening on port %d', port);
});
