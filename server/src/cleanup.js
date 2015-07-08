var fs = require('fs')
    , config = require('../config/config.json')
    , logger = require('./logger');

module.exports = function (filename) {
  logger.log('info', 'Deleting files');
  fs.readdir(config.uploadFolderPath, function (err, files) {
    if (err) logger.log('error', err);
    else {
      files.forEach(function(file) {
        if (file.indexOf(filename.slice('.')[0]) === 0) {
          fs.unlink(config.uploadFolderPath + '/' + file, function () {
            logger.log('info', 'Deleted file: ' + file);
          });
        }
      });
    }
  });
};
