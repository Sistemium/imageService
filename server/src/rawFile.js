import FileType from 'file-type';
import { Magic, MAGIC_MIME_TYPE } from 'mmmagic';

const magic = new Magic(MAGIC_MIME_TYPE);
const config = require('../config/config.json');

const debug = require('debug')('stm:ims:rawFile');

export async function checkIfRaw({ path }) {

  const detect = await FileType.fromFile(path);
  let { mime } = detect || {};

  if (!mime || mime === 'application/x-cfb') {
    mime = await getMagicMime(path);
  }

  if (!mime) {
    return null;
  }

  const ext = config.rawFile[mime]

  return ext && { ext, mime };

}

async function getMagicMime(path) {
  return new Promise((resolve, reject) => {
    magic.detectFile(path, (err, res) => {
      debug('getMagicMime', res);
      if (err) {
        reject(err);
        return;
      }
      resolve(res);
    });
  });
}
