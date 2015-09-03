'use strict';

var fs = require('fs')
    , imageSize = require('image-size')
    , config = require('../config/config.json');


module.exports = function (filePath) {
  var content = fs.readFileSync(filePath);
  return imageSize(content);
};
