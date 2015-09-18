'use strict';

var gm = require('gm').subClass({imageMagick: true})
    , imageInfo = require('../config/config.json').imageInfo
    , config = require('../config/config.json')
    , Q = require('q')
    , extend = require('util')._extend;

module.exports = function (req, options, callback) {

    var opt = extend({}, options);
    var name = options.key || ''
        , width = opt.imageInfo.width || 100
        , height = opt.imageInfo.height || 100
        , image = opt.image || {};

    var deffered = Q.defer()
        , imagePath = image.path.replace(/(\.jpeg|\.jpg|\.png)$/i, function (ext) {
            return name + ext;
        });

    gm(image.path)
        .setFormat(config.format)
        .resize(width, height, '>')
        .write(imagePath, function (err) {
            if (err) {
                throw err;
            }
            var timestamp = Date.now();
            console.log(timestamp + ' info: Image was resized and converted');
            callback(opt, deffered);
        });

    return deffered.promise;
};
