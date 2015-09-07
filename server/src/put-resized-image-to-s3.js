'use strict';

var AWS = require('aws-sdk')
    , fs = require('fs')
    , config = require('../config/config.json')
    , getFileInfo = require('./get-file-info');

module.exports = function (options, deffered) {
    var timestamp = Date.now();
    var image = options.image || {}
        , dataForUrlFormation = options.dataForUrlFormation || {}
        , name = options.key;

    var resizedImageStream = fs.createReadStream(image.path.replace(/(\.jpeg|\.jpg|\.png)$/i, function (ext) {
            return name + ext;
        }))
        , key = dataForUrlFormation.folder + '/'
            + dataForUrlFormation.checksum + '/'
            + options.key + '.' + options.extension;

    var filePath = image.path.replace(/(\.jpeg|\.jpg|\.png)$/i, function (ext) {
        return name + ext;
    });
    var fileInfo = getFileInfo(filePath);
    var s3 = new AWS.S3(config.awsCredentials);
    var params = {
        Bucket: config.s3.Bucket,
        Key: key,
        Body: resizedImageStream,
        ContentType: image.contentType,
        Metadata: {
            'width': fileInfo.width.toString(),
            'height': fileInfo.height.toString()
        }
    };
    s3.putObject(params, function (err, data) {
        if (err) {
            timestamp = Date.now();
            console.log(timestamp + ' error: %s', err);
            deffered.reject(err);
        }
        else {
            data = {
                name: name,
                width: fileInfo.width,
                height: fileInfo.height,
                bucketKey: key
            };

            deffered.resolve(data);
        }
    });
};
