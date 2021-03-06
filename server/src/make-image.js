import sharp from 'sharp';

// const debug = require('debug')('stm:ims:make-image');
// const config = require('../config/config.json');

export default async function (req, options) {

  const opt = { ...options };
  const width = opt.imageInfo.width || 100;
  const height = opt.imageInfo.height || 100;
  const { image = {} } = opt;

  const thumbnail = sharp(image.path)
    .rotate()
    .resize({ width, height, fit: 'inside', withoutEnlargement: true });

  if (options.trim) {
    thumbnail.trim();
  }

  const png = thumbnail.png();

  opt.buffer = await png.toBuffer();
  opt.metadata = await sharp(opt.buffer).metadata();

  return opt;

}
