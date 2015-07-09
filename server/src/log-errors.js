var logger = require('./logger');

module.exports = function(err, req, res, next) {
  logger.log('error', err);
  logger.log('error', err.stack);
  next(err);
}
