import sharp from 'sharp';

const config = require('../../config/config.json');

const gm = require('gm').subClass({
  imageMagick: true
});
const debug = require('debug')('stm:ims:check-format');

export default async function (image) {

  debug('Checking file format');

  const md = await sharp(image.path).metadata();

  debug(md);

  const { format } = md;

  if (!config.contentTypeFor && !config.contentTypeFor[format.toLowerCase()]) {
    throw new Error('Incorrect configuration');
  }

  const contentType = config.contentTypeFor[format.toLowerCase()];

  if (!contentType) {
    throw new Error('Unsupported format');
  }

  image.contentType = contentType;
  debug('Format is supported, contentType: %s', image.contentType);
  image.matadata = md;

  return image;

}
