import request from 'request';
import contentDisposition from 'content-disposition';

export default function (req, res, next) {

  const { url, name } = req.query;

  if (!url) {
    next('Url not specified');
    return;
  }

  if (name) {
    const fileName = contentDisposition(name, { fallback: false });
    res.header('Content-Disposition', fileName);
  }

  request.get(url)
    .pipe(res);

}
