In config/config.json configuration for application:

```json
{
  "imageInfo": {
     "smallImage": {
       "width": 800,
       "height": 800,
       "suffix": "_small"
     },
     "mediumImage": {
       "width": 2000,
       "height": 2000,
       "suffix": "_medium"
     },
     "thumbnail": {
        "width": 64,
        "height": 64,
        "quality": 100,
        "suffix": "_thumbnail"
     }
  },
  "contentTypeFor": {
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png"
  },
  "imageName": "original",
  "imageExtension": "png",
  "supportedFormats": [
    "PNG",
    "JPG",
    "JPEG"
  ],
  "uploadFolderPath": "../uploads",
  "s3": {
    "Bucket": "sisdev",
    "Domain": "https://s3-eu-west-1.amazonaws.com/"
  },
  "applicationPort": 8080,
  "awsCredentials": {
    "aws_access_key_id": "MY_AWS_ACCESS_KEY_ID",
    "aws_secret_access_key": "MY_AWS_SECRET_ACCESS_KEY"
  }
}
```
