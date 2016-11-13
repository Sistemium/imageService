const fs = require('fs')
const config = require('../config/config.json');
const _ = require('lodash');
const debug = require('debug')('stm:ims:cleanup');

module.exports = function(directory) {

  debug('Deleting files');

  fs.readdir(directory, (err, files) => {

    if (err) {
      throw new Error(err);
    }

    _.each(files, file => {
      var filePath = `${directory}/${file}`;
      debug('Deleting file: ' + filePath);
      fs.unlinkSync(filePath);
    });

    fs.rmdir(directory, function(err) {
      if (err) {
        debug('Delete directory error:', err);
      } else {
        debug('Deleted directory: ', directory);
      }
    });

  });

};
