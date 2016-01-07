var chai = require('chai')
    , expect = require('chai').expect
    , _ = require('lodash')
    , checkJsonFileStructure = require('../server/src/validation/check-json-file-structure');

//TODO: rewrite using stubs
describe('Check json file structure', function () {
    it('should get json from s3', function (done) {
        var AWS = require('aws-sdk')
            , config = require('../server/config/config.json');

        var s3 = new AWS.S3(config.awsCredentials);
        var params = {
            Bucket: config.s3.Bucket,
            Key: 'undefined/c702282adbaf13f5b331c2059b5cc360/picturesInfo.json'
        };
        s3.getObject(params, function(err, data) {
            if (err) console.log('error');
            else {
                expect(data).to.not.be.a('null');
                expect(data).to.be.a('object');
                expect(data.Body).to.not.be.a('null');

                var parsedData = JSON.parse(data.Body.toString());
                _.each(config.imageInfo, function (n, key) {
                    var res = _.where(parsedData, {'name': key});
                    expect(res.length).to.equal(1);
                });
                done();
            }
        })
    });
});