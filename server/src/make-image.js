import _ from 'lodash';

const gm = require('gm').subClass({ imageMagick: true });
const debug = require('debug')('stm:ims:make-image');
const config = require('../config/config.json');

export default function (req, options) {

  const opt = _.assign({}, options);
  const name = options.key || '';
  const width = opt.imageInfo.width || 100;
  const height = opt.imageInfo.height || 100;
  const image = opt.image || {};

  const imagePath = image.path.replace(/(\.jpeg|\.jpg|\.png)$/i, ext => `${name}${ext}`);

  return new Promise((resolve, reject) => {
    try {
      gm(image.path)
        .setFormat(config.format)
        .resize(width, height, '>')
        .autoOrient()
        .write(imagePath, err => {
          if (err) {
            reject(err);
            return;
          }
          debug('Image is resized and converted:', name);
          resolve(opt);
        })
    } catch (e) {
      reject(e)
    }
  });

};
