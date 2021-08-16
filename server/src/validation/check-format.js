import sharp from 'sharp';
import { checkIfRaw } from '../rawFile';

const config = require('../../config/config.json');
const debug = require('debug')('stm:ims:check-format');

export default async function (image) {

  const raw = await checkIfRaw(image);

  // debug('raw', raw);

  if (raw) {
    image.raw = raw;
    return;
  }

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
  // image.metadata = md;

  return image;

}
