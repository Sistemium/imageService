'use strict';

var fs = require('fs')
    , config = require('../config/config.json');

module.exports = function (directory, filename) {
    var timestamp = Date.now();
    console.log(timestamp + ' info: Deleting files');
    fs.readdir(directory, function (err, files) {
        if (err) {
            timestamp = Date.now();
            console.log(timestamp + ' error: ' + err);
            throw new Error(err);
        }
        else {
            files.forEach(function (file) {
                if (file.indexOf(filename.slice('.')[0]) === 0) {
                    fs.unlink(directory + '/' + file, function () {
                        timestamp = Date.now();
                        console.log(timestamp + ' info: Deleted file: ' + file);
                    });
                }
            });
        }
        var dir = directory;
        console.log(dir);
        fs.rmdir(dir, function () {
            timestamp = Date.now();
            console.log(timestamp + ' info: Deleted directory: ', dir);
        })
    });
};
