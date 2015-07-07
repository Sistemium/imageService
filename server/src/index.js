// require('nodetime').profile({
//     accountKey: '12fc76f030d3c5ab00596f1f5648ff30e8affd95',
//     appName: 'Image service'
//   })
var express = require('express')
    , multer = require('multer')
    , config = require('../config/config.json')
    , processRequest = require('./process-request')
    , app = express()
    , port = config.applicationPort;

app.use(express.static('../../client'));
app.use(multer({dest: config.uploadFolderPath + '/'}));
app.post('/', function (req, res) {
  processRequest(req, res);
});
app.get('/', function (req, res) {
  res.send();
})

app.listen(port, function() {
  console.log('Server listening on port %d', port);
});
