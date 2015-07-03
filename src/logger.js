var winston = require('winston');

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ json: false, timestamp: true }),
    new winston.transports.File({ name: 'info-file', filename: __dirname + '/logs/filelog-info.log', level: 'info', json: false })
  ],
  exceptionHandlers: [
    new (winston.transports.Console)({ json: false, timestamp: true }),
    new winston.transports.File({ name: 'error-file', filename: __dirname + '/logs/filelog-exceptions.log', json: false, level: 'error' })
  ],
  exitOnError: false
});

module.exports = logger;
