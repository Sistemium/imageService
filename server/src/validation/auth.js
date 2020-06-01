import request from 'request';

const config = require('../../config/config.json');
const debug = require('debug')('stm:ims:auth');

export default function () {

  const { url } = config.auth || {};

  if (!url) {
    return function (req, res, next) {
      next()
    }
  }

  return function (req, res, next) {

    const options = {
      url: url,
      headers: {
        'Authorization': req.headers.authorization
      },
    };

    request(options, function (error, response, body) {

      if (error) console.error(error);

      if (!error && response.statusCode === 200) {
        debug('success:', body);
        next();
      } else {
        debug('error:', response.statusCode, body);
        res.status(response.statusCode);
        return res.send(body);
      }

    });

  }

};
