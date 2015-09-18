'use strict';

var config = require('../../config/config.json')
    , request = require('request')
    , fs = require('fs')
    , uuid = require('node-uuid')
    , mkdirp = require('mkdirp');

module.exports = function () {
    return function (req, res, next) {
        if (!req.query.src) next(new Error('Picture link not passed!'));
        request.get(req.query.src).on('response', function (response) {
            req.imageFromSrc = true;
            var folder = config.uploadFolderPath + '/' + uuid.v4();
            var imageName = config.imageInfo.original.name + '.' + config.format;
            var imagePath = folder + '/' + imageName;
            mkdirp(folder, function () {
                var image = {
                    path: imagePath,
                    name: imageName,
                    folder: folder
                };
                req.image = image;
                var file = response.pipe(fs.createWriteStream(imagePath));
                file.on('finish', function () {
                    next();
                });
            });
        }).on('error', function (err) {
            next(err);
        });
    }
};

