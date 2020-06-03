import sharp from 'sharp';

// const gm = require('gm').subClass({ imageMagick: true });
const debug = require('debug')('stm:ims:make-image');
const config = require('../config/config.json');

export default async function (req, options) {

  const opt = { ...options };
  const width = opt.imageInfo.width || 100;
  const height = opt.imageInfo.height || 100;
  const { image = {} } = opt;

  const thumbnail = sharp(image.path)
    .resize({ width, height, fit: 'inside', withoutEnlargement: true })
    .png();

  opt.buffer = await thumbnail.toBuffer();
  opt.metadata = await sharp(opt.buffer).metadata();

  return opt;

}
