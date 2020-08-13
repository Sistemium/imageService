import sharp from 'sharp';

const config = require('../../config/config.json');
const debug = require('debug')('stm:ims:check-format');

export default async function (image) {

  const md = await sharp(image.path).metadata();
  const { format } = md;

  if (!config.contentTypeFor && !config.contentTypeFor[format.toLowerCase()]) {
    throw new Error('Incorrect configuration');
  }

  const contentType = config.contentTypeFor[format.toLowerCase()];

  if (!contentType) {
    throw new Error('Unsupported format');
  }

  debug('supported:', contentType);

  image.contentType = contentType;
  image.matadata = md;

  return image;

}
