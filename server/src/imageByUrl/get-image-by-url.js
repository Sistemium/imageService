'use strict';

var config = require('../../config/config.json')
    , request = require('request')
    , fs = require('fs');

module.exports = function () {
    return function (req, res, next) {
        if (!req.query.src) next(new Error('Picture link not passed!'));
        request.get(req.query.src).on('response', function (response) {
            var imageName = config.imageInfo.original.name + '.' + config.imageInfo.original.extension;
            var imagePath = config.uploadFolderPath + '/' + imageName;
            var file = response.pipe(fs.createWriteStream(imagePath));
            file.on('open', function () {
                next();
            });
        }).on('error', function (err) {
            next(err);
        });
    }
};

