var fs = require('fs')
    , gm = require('gm').subClass({imageMagick: true})
    , config = require('./config/config.json');

/**
 *
 * name size of the image: _small. _medium. _thumbnail.
 *
 **/
module.exports = function (req, name, callback) {
  var image = req.files.filedata;
  gm(image.path)
  .format(function (err, format) {
    if (err) return;

    var imagePath = undefined;
    if (format === 'PNG' || format === 'JPG') {
      imagePath = image.path.slice(0, -4) + name + format.toLowerCase();
    }
    else if (format === 'JPEG') {
      imagePath = image.path.slice(0, -5) + name + 'jpeg';
    }
    else {
      throw new Error('Unsupported image format...');
    }

    switch (name) {
      case '_small.' :
        gm(image.path)
        .resize(config.smallImage.width, config.smallImage.height)
        .noProfile()
        .write(imagePath, function (err) {
          if (!err) {
            console.log('Image was resized and written to %s', imagePath);
            callback(image, name.slice(0, -1));
          }
        });
        break;
      case '_medium.' :
        gm(image.path)
        .resize(config.mediumImage.width, config.mediumImage.height)
        .noProfile()
        .write(imagePath, function (err) {
          if (!err) {
            console.log('Image was resized and written to %s', imagePath);
            callback(image, name.slice(0, -1));
          }
        });
        break;
      case '_thumbnail.' :
        gm(image.path)
        .thumb(config.thumbnail.width, config.thumbnail.height, imagePath, config.thumbnail.quality, function (err) {
          if (!err) {
            console.log('Thumbnail was successfully saved at %s', imagePath);
            callback(image, name.slice(0, -1));
          }
        });
        break;
    }
  });
};
