process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express')
    , auth = require('./validation/auth')
    , bodyParser = require('body-parser')
    , multer = require('multer')
    , config = require('../config/config.json')
    , multerConfig = require('../config/multer-config')
    , processRequest = require('./process-request')
    , logErrors = require('./log-errors')
    , sendImage = require('./imageByUrl/sendPostRequest')
    , app = express()
    , port = config.applicationPort
    , allowCrossDomain = function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'HEAD,GET,PUT,DELETE,POST,OPTIONS,PATCH');
        res.header('Access-Control-Allow-Headers', 'Authorization, Start-Page, Page-Size, Content-Type');
        next();
    };

app.use(allowCrossDomain);
app.use(bodyParser.json());

app.post('/api/image/', multer(multerConfig), processRequest(), logErrors, function(err, req, res, next) {
  if (err) {
    res.status(500).send({error: 'Something went wrong...'});
  } else {
    next();
  }
});
app.get('/api/image/', function (req) {
    sendImage(req);
});

app.listen(port, function() {
  console.log('Server listening on port %d', port);
});
