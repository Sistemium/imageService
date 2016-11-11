const config = require('../../config/config.json');
const request = require('request');

module.exports = function () {

  var timestamp = Date.now();
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
      if (error) console.log(error);
      if (!error && response.statusCode === 200) {
        timestamp = Date.now();
        console.log(timestamp + ' info: Body: %s', body);
        next();
      } else {
        timestamp = Date.now();
        console.log(timestamp + ' info: Response status code %s\nResponse body: %s', response.statusCode, body);
        res.status(response.statusCode);
        return res.send(body);
      }
    });
  }
};
