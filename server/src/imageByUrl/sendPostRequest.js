var config = require('../../config/config.json')
    , request = require('request');

var sendImage = function (req) {
    var imsServiceUrl = config.imsUrl;
    if (process.env.NODE_ENV === 'development') {
        imsServiceUrl = 'http://localhost:' + config.applicationPort + '/api/image';
    }

    request.get(req.query.src).on('response', function(response) {
        console.log(response.statusCode);// 200
        console.log(response.headers['content-type']); // 'image/png'
    }).pipe(request.post(imsServiceUrl));
};

module.exports = sendImage;