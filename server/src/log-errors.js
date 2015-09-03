'use strict';

module.exports = function(err, req, res, next) {
  var timestamp = Date.now();
  console.log(timestamp + ' error: %s', err);
  timestamp = Date.now();
  console.log(timestamp+' error: %s', err.stack);
  next(err);
};
