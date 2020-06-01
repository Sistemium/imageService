export default function (err, req, res, next) {
    const timestamp = Date.now();
    console.log(timestamp + ' error: %s', err);
    console.log(timestamp + ' error: %s', err.stack);
    next(err);
}
