var config = require('../config/config.json')
    , logger = require('./logger')
    , request = require('request');

module.exports = function () {
  return function (req, res, next) {
    console.log(req.headers);

    var options = {
      url: config.auth.url,
      headers: {
        'Authorization': req.headers.authorization
      }
    };
    request(options, function (error, response, body) {
      if (error) console.log(error);
      if (!error && response.statusCode === 200) {
        logger.log('info', 'Body: %s', JSON.stringify(body));
        next();
      } else {
        logger.log('info', 'Response status code %s\nResponse body: %s',response.statusCode, body)
        res.status(response.statusCode).send(body);
      }
    });
  };
};
