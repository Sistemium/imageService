// require('nodetime').profile({
//     accountKey: '12fc76f030d3c5ab00596f1f5648ff30e8affd95',
//     appName: 'Image service'
//   })
var express = require('express')
    , auth = require('./auth')
    , multer = require('multer')
    , config = require('../config/config.json')
    , multerConfig = require('../config/multer-config')
    , processRequest = require('./process-request')
    , logErrors = require('./log-errors')
    , app = express()
    , port = config.applicationPort;

app.use(express.static('../../client'));

app.post('/api/image/', multer(multerConfig), function (req, res) {
  try {
    processRequest(req, res);
  } catch(err) {
    res.status(500).send({error: 'Something went wrong...'});
  }
});
app.get('/api/image/', function (req, res) {
  res.send('/api/image/');
});

app.use(logErrors);
app.use(function(err, req, res, next) {
  if (err) {
    res.status(500).send({error: 'Something went wrong...'});
  } else {
    next();
  }
});

app.listen(port, function() {
  console.log('Server listening on port %d', port);
});
