import {S3} from 'aws-sdk';
import {AppConstants} from '../../keys';
const S3Config = {
  accessKeyId: AppConstants.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: AppConstants.AWS_S3_SECRET_ACCESS_KEY,
  region: AppConstants.AWS_S3_REGION,
};

export async function uploadFileToS3(fileContent: string, filePath: string) {
  const s3 = new S3(S3Config);

  const params = {
    Bucket: AppConstants.AWS_S3_BUCKET,
    Key: filePath,
    Body: fileContent,
    ContentType: 'application/octet-stream"',
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, function (err, data) {
      if (err) {
        throw err;
      }
    }).send((err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
}

export async function getObjectFromS3(objectName: string): Promise<string> {
  const s3 = new S3(S3Config);

  const params = {
    Bucket: AppConstants.AWS_S3_BUCKET,
    Key: objectName,
  };

  return new Promise((resolve, reject) => {
    s3.getObject(params, function (err, data) {
      if (err) {
        throw err;
      }
    }).send((err, data) => {
      if (err) {
        return reject(err);
      }

      return resolve(data.Body.toString());
    });
  });
}

export async function deleteObjectFromS3(objectName: string) {
  const s3 = new S3(S3Config);

  const params = {
    Bucket: AppConstants.AWS_S3_BUCKET,
    Key: objectName,
  };

  return new Promise((resolve, reject) => {
    s3.deleteObject(params, function (err, data) {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
}
