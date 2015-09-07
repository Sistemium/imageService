In config/config.json configuration for application:

```json
{
  "imageInfo": {
       "smallImage": {
         "width": 800,
         "height": 800,
         "suffix": "small"
       },
       "mediumImage": {
         "width": 2000,
         "height": 2000,
         "suffix": "medium"
       },
       "thumbnail": {
          "width": 200,
          "height": 200,
          "quality": 100,
          "suffix": "thumbnail"
       },
       "original": {
         "name": "original",
         "extension": "png"
       }
    },
    "format": "png",
    "contentTypeFor": {
      "jpeg": "image/jpeg",
      "jpg": "image/jpeg",
      "png": "image/png"
    },
    "picturesInfoFileName": "picturesInfo.json",
    "uploadFolderPath": "../uploads",
    "s3": {
      "Bucket": "sisdev",
      "Domain": "https://s3-eu-west-1.amazonaws.com/"
    },
    "applicationPort": 8080,
    "auth": {
      "url":"url",
      "orgPath": "orgPath"
    },
    "awsCredentials": {
      "accessKeyId": "accessKeyId",
      "secretAccessKey": "secretAccessKey"
    }
}
```
