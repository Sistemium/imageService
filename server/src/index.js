process.env.NODE_ENV = process.env.NODE_ENV || 'development';

import express from 'express';
import bodyParser from 'body-parser';
import multer from 'multer';
import AWS from 'aws-sdk';

import auth from './validation/auth';
import multerConfig from '../config/multer-config';
import processRequest from './process-request';
import logErrors from './log-errors';
import getImageByUrl from './imageByUrl/get-image-by-url';
import debug from 'debug';

const config = require('../config/config.json');
const app = express();
const port = config.applicationPort;

debug.log = console.info.bind(console);

AWS.config.update({
  region: 'eu-west-1',
  accessKeyId: config.awsCredentials.accessKeyId,
  secretAccessKey: config.awsCredentials.secretAccessKey
});

app.use(allowCrossDomain);
app.use(bodyParser.json());

const processor = [multer(multerConfig).any(), processRequest, logErrors, nextOnErrors];

app.post('/api/image', auth(), processor);
app.get('/api/image', auth(), getImageByUrl, processor);

app.listen(port, function () {
  debug('stm:ims')('Server listening on port %d', port);
});

function allowCrossDomain(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'HEAD,GET,PUT,DELETE,POST,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Authorization,Content-Type');
  next();
}

function nextOnErrors(err, req, res, next) {
  if (err) {
    res.status(500).json({ error: 'Something went wrong' });
  } else {
    next();
  }
}
