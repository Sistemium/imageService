import sharp from 'sharp';

// const gm = require('gm').subClass({ imageMagick: true });
const debug = require('debug')('stm:ims:make-image');
const config = require('../config/config.json');

export default async function (req, options) {

  const opt = { ...options };
  const width = opt.imageInfo.width || 100;
  const height = opt.imageInfo.height || 100;
  const { image = {}, key: name = '' } = opt;

  // const imagePath = image.path.replace(/(\.jpeg|\.jpg|\.png)$/i, ext => `${name}${ext}`);

  // debug(imagePath, opt);

  const img = sharp(image.path);

  // debug(img);

  const thumbnail = img
    .resize(width, height)
    // .max()
    .png();

  opt.buffer = await thumbnail.toBuffer();
  opt.metadata = { width, height };

  return opt;

}
