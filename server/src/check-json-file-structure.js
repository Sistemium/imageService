var AWS = require('aws-sdk')
    , config = require('../config/config.json')
    , logger = require('./logger')
    , _ = require('lodash')
    , Q = require('q');

module.exports = function (prefix) {
    var s3 = new AWS.S3(config.awsCredentials)
        , key = prefix + config.picturesInfoFileName
        , params = {
            Bucket: config.s3.Bucket,
            Key: key
        },
        deffered = Q.defer();
    logger.log('info', 'Key: %s', key);
    s3.getObject(params, function (err, data) {
        if (err) {
            logger.log('error', 'Error occurred... %s', err);
            throw new Error(err);
            deffered.reject(err);
        } else {
            var parsedData = JSON.parse(data.Body.toString());
            _.each(config.imageInfo, function (n, key) {
                var res = _.where(parsedData, {'name': key});
                if (res.length !== 1) {
                    deffered.reject(new Error('Incorrect \"' + config.picturesInfoFileName + '\"'));
                }
            });
            deffered.resolve();
        }
    });
    return deffered.promise;
}