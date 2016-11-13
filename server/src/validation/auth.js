const config = require('../../config/config.json');
const request = require('request');
const debug = require('debug')('stm:ims:auth');

module.exports = function () {

  var url = config.auth && config.auth.url;

  if (!url) {
    return function (req, res, next) {
      next()
    }
  }

  return function (req, res, next) {
    var options = {
      url: url,
      headers: {
        'Authorization': req.headers.authorization
      }
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
