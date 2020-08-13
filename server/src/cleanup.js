import fs from 'fs';
import _ from 'lodash';

const debug = require('debug')('stm:ims:cleanup');

export default function(directory) {

  fs.readdir(directory, (err, files) => {

    if (err) {
      throw err;
    }

    _.each(files, file => {
      const filePath = `${directory}/${file}`;
      debug('Deleting file: ' + filePath);
      fs.unlinkSync(filePath);
    });

    fs.rmdir(directory, rmErr => {
      if (rmErr) {
        debug('Delete directory error:', rmErr);
      } else {
        debug('Deleted directory: ', directory);
      }
    });

  });

};
