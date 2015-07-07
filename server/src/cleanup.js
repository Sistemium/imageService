var fs = require('fs')
    , logger = require('./logger');

module.exports = function (dirname, filename) {
  logger.log('info', 'Deleting files');
  fs.readdir(dirname, function (err, files) {
    if (err) logger.log('error', err);
    else {
      files.forEach(function(file) {
        if (file.indexOf(filename.slice('.')[0]) === 0) {
          fs.unlink(dirname + '/' + file, function () {
            logger.log('info', 'Deleted file: ' + file);
          });
        }
      });
    }
  });
};
