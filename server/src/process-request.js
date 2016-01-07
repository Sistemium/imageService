'use strict';

var config = require('../config/config.json')
    , checkFormat = require('./validation/check-format')
    , putAllFilesToS3 = require('./put-all-files-to-s3')
    , notAlreadyUploadedOrBadData = require('./validation/check-if-checksum-exist-on-s3')
    , generateChecksum = require('./generate-checksum')
    , getResponse = require('./get-response')
    , cleanupFiles = require('./cleanup')
    , fs = require('fs')
    , Q = require('q')
    , mkdirp = require('mkdirp')
    , uuid = require('node-uuid');

var timestamp = Date.now();
function getResponseAndCleanup(req, res, next) {
    var dataForUrlFormation = {
        checksum: req.image.checksum,
        folder: req.body.folder || req.query.folder
    };
    getResponse(req, res, next, dataForUrlFormation)
        .then(function () {
            cleanupFiles(req.image.folder ,req.image.name, next);
        }, function (err) {
            next(err);
        });
}

function processImage(req, res, next) {
    generateChecksum(req.image.path)
        .then(function (checksum) {
            req.image.checksum = checksum;
            // check if already exist on amazon s3 and if it correct
            notAlreadyUploadedOrBadData(req)
                .then(function () {
                    putAllFilesToS3(req, next)
                        .then(function () {
                            getResponseAndCleanup(req, res, next);
                        }, function (err) {
                            timestamp = Date.now();
                            console.log(timestamp + ' error: %s', err);
                            next(err);
                        });
                }, function () {
                    getResponseAndCleanup(req, res, next);
                });
        }, function (error) {
            timestamp = Date.now();
            console.log(timestamp + ' error: %s', error);
            next(error);
        });
}

function checkFormatAndStartProcessing(req, res, next) {
    checkFormat(req.image).then(function (image) {
        timestamp = Date.now();
        console.log(timestamp + ' info: Strarting processing image');
        processImage(req, res, next);
    }, function (err) {
        timestamp = Date.now();
        console.log(timestamp + ' error: %s', err);
        next(err);
    });
}

module.exports = function () {
    return function (req, res, next) {
        if (req.files.file !== undefined) {
            var image = req.files.file;
            var folder = config.uploadFolderPath + '/' + uuid.v4();
            var img = {
                path: image.path,
                name: image.name,
                folder: folder
            };
            mkdirp(folder, function () {
                var image = {
                    path: img.path,
                    name: img.name,
                    folder: img.folder
                };
                req.image = image;
                req.pipe(fs.createWriteStream(folder + '/' + img.name));
                checkFormatAndStartProcessing(req, res, next);
            });
        } else if (req.imageFromSrc) {
            timestamp = Date.now();
            console.log(timestamp + ' info: image from src');
            checkFormatAndStartProcessing(req, res, next);
        } else {
            timestamp = Date.now();
            console.log(timestamp + ' info: Binary content request in');
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
                req.pipe(fs.createWriteStream(imagePath));
                checkFormatAndStartProcessing(req, res, next);
            });
        }
    }
};
