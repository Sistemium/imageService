var fs = require('fs')
    , gm = require('gm').subClass({imageMagick: true})
    , config = require('../config/config.json');

    fs.readdir(config.uploadFolderPath, function (err, files) {
      if (err) console.log(err);
      files.forEach(function (file) {
        gm(config.uploadFolderPath + '/' + file).size(function (err, features) {
          if (err) throw err;
          console.log(features);
        });
      });
    });
