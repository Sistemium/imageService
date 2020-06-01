import fs from 'fs';
import imageSize from 'image-size';

export default function (filePath) {
    const content = fs.readFileSync(filePath);
    return imageSize(content);
};
