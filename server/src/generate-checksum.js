import crypto from 'crypto';
import fs from 'fs';

export default function(image) {

  const stream = fs.createReadStream(image);
  const hash = crypto.createHash('md5');

  stream.on('data', data => hash.update(data, 'utf8'));

  return new Promise((resolve, reject) => {

    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', err => reject(new Error(err)));

  });

}
