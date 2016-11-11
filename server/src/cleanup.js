const fs = require('fs')
const config = require('../config/config.json');
const _ = require('lodash');

module.exports = function (directory, filename) {

  var timestamp = Date.now();
  console.log(timestamp + ' info: Deleting files');

  fs.readdir(directory, (err, files) => {

    if (err) {
      timestamp = Date.now();
      console.log(timestamp + ' error: ' + err);
      throw new Error(err);
    } else {
      _.each(files, file => {
        if (file.indexOf(filename.slice('.')[0]) === 0) {
          fs.unlink(directory + '/' + file, function () {
            timestamp = Date.now();
            console.log(timestamp + ' info: Deleted file: ' + file);
          });
        }
      });
    }

    fs.rmdir(directory, function () {
      timestamp = Date.now();
      console.log(timestamp + ' info: Deleted directory: ', directory);
    });

  });

};
