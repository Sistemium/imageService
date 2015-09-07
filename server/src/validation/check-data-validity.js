'use strict';

var config = require('../../config/config.json')
    , imageInfo = config.imageInfo
    , _ = require('lodash');

module.exports = function (data) {
    var counter = 0;
    // check that keys in config.imageInfo equals files uploaded to s3
    _.each(imageInfo, function (item, key) {
        data.forEach(function (objFromS3) {
            var filename = objFromS3.Key.split('/').splice(-1)[0].split('.')[0];
            if (filename === key) {
                counter++;
            }
        })
    });
    if (counter !== Object.keys(imageInfo).length) {
        throw new Error('Count of configured images, does not match count of images on s3');
    }
}
