const gm = require('gm').subClass({imageMagick: true});
const config = require('../config/config.json');
const _ = require('lodash');
const debug = require('debug')('stm:ims:make-image');

module.exports = function (req, options) {

  var opt = _.assign({}, options);
  var name = options.key || '';
  var width = opt.imageInfo.width || 100;
  var height = opt.imageInfo.height || 100;
  var image = opt.image || {};

  var imagePath = image.path.replace(/(\.jpeg|\.jpg|\.png)$/i, function (ext) {
    return name + ext;
  });

  return new Promise((resolve, reject) => {
    try {
      gm(image.path)
        .setFormat(config.format)
        .resize(width, height, '>')
        .autoOrient()
        .write(imagePath, function (err) {
          if (err) {
            return reject(err);
          }
          debug('Image is resized and converted:', name);
          resolve(opt);
        })
    } catch (e) {
      reject(e)
    }
  });

};
