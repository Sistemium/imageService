var fs = require('fs');

module.exports = function (dirname) {
  fs.readdir(dirname, function (err, files) {
    if (err) console.log(err);
    else {
      files.forEach(function(file) {
        fs.unlink(dirname + '/' + file, function () {
          console.log('Deleted file: ' + file);
        });
      });
    }
  });
};
