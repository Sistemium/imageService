'use strict';

const crypto = require('crypto');
const fs = require('fs');

module.exports = function(image) {

  var stream = fs.createReadStream(image);
  var hash = crypto.createHash('md5');

  stream.on('data', data => hash.update(data, 'utf8'));

  return new Promise((resolve, reject) => {

    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', err => reject(new Error(err)));

  });

}
