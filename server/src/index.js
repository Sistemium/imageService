'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const express = require('express')
const auth = require('./validation/auth')
const bodyParser = require('body-parser')
const multer = require('multer')
const config = require('../config/config.json')
const multerConfig = require('../config/multer-config')
const processRequest = require('./process-request')
const logErrors = require('./log-errors')
const getImageByUrl = require('./imageByUrl/get-image-by-url')
const app = express()
const port = config.applicationPort

function allowCrossDomain (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'HEAD,GET,PUT,DELETE,POST,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Authorization,Content-Type');
  next();
}

function nextOnErrors (err, req, res, next) {
  if (err) {
    res.status(500).json({error: 'Something went wrong'});
  } else {
    next();
  }
}

app.use(allowCrossDomain);
app.use(bodyParser.json());

const processor = [multer(multerConfig), processRequest(), logErrors, nextOnErrors];

app.post('/api/image', auth(), processor);
app.get('/api/image', auth(), getImageByUrl(), processor);

app.listen(port, function () {
  console.log('Server listening on port %d', port);
});
