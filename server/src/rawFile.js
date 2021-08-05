import FileType from 'file-type';

const config = require('../config/config.json');
// const debug = require('debug')('stm:ims:rawFile');

export async function checkIfRaw(image) {

  const detect = await FileType.fromFile(image.path);

  if (!detect) {
    return null;
  }

  const ext = config.rawFile[detect.mime]

  return ext && { ext, mime: detect.mime };

}
