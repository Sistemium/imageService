var fs = require('fs')
    , config = require('../config/config.json');

module.exports = function (filename) {
  console.log(' Deleting files');
  fs.readdir(config.uploadFolderPath, function (err, files) {
    if (err) {
      var timestamp = Date.now();
      console.log(timestamp + ' error: ' + err);
      throw new Error(err);
    }
    else {
      files.forEach(function(file) {
        if (file.indexOf(filename.slice('.')[0]) === 0) {
          fs.unlink(config.uploadFolderPath + '/' + file, function () {
            timestamp = Date.now();
            console.log(timestamp + 'info: Deleted file: ' + file);
          });
        }
      });
    }
  });
};
