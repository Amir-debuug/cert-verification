import {HttpErrors} from '@loopback/rest';
import common = require('oci-common');
import os = require('oci-objectstorage');
import st = require('stream');

//  Config file path : ~/.oci/config"
/* common.ConfigFileReader.parseDefault(null); */
const bucket = 'bucket-tracifier-qa-01';

let namespace: string;
/* const provider: common.ConfigFileAuthenticationDetailsProvider =
  new common.ConfigFileAuthenticationDetailsProvider();
const client = new os.ObjectStorageClient({
  authenticationDetailsProvider: provider,
}); */

async function getNamespace(): Promise<string> {
  const request: os.requests.GetNamespaceRequest = {};
  const response = {value : null}//await client.getNamespace(request);
  return response.value;
}

export async function putObject(
  fileContent: string | Buffer,
  objectName: string,
  contentType: string,
) {
  try {
    if (namespace === undefined) namespace = await getNamespace();

    const putObjectRequest: os.requests.PutObjectRequest = {
      namespaceName: namespace,
      bucketName: bucket,
      putObjectBody: fileContent,
      objectName: objectName,
      contentLength: fileContent.length,
      contentType: contentType, //'application/PDF',
    };
    const putObjectResponse = ''//await client.putObject(putObjectRequest);
    return putObjectResponse;
  } catch (error) {
    throw new HttpErrors.BadRequest(
      `Error occured when storing file. ${error}`,
    );
  }
}

export async function getObject(objectName: string): Promise<Buffer> {
  try {
    if (namespace === undefined) namespace = await getNamespace();
    const getObjectRequest: os.requests.GetObjectRequest = {
      objectName: objectName,
      bucketName: bucket,
      namespaceName: namespace,
    };
    const getObjectResponse = {value : ''}//await client.getObject(getObjectRequest);
    const stream/* : st.Readable */ = getObjectResponse.value;
    const toArray = require('stream-to-array');

    return toArray(stream).then(function (parts) {
      const buffers = [];
      for (let i = 0, l = parts.length; i < l; ++i) {
        const part = parts[i];
        buffers.push(part instanceof Buffer ? part : new Buffer(part));
      }
      return Buffer.concat(buffers);
    });
  } catch (error) {
    throw new HttpErrors.BadRequest(
      `Error occured when retrieving file. ${error}`,
    );
  }
}

export async function deleteObject(objectName: string) {
  try {
    if (namespace === undefined) namespace = await getNamespace();
    const deleteObjectRequest: os.requests.DeleteObjectRequest = {
      namespaceName: namespace,
      bucketName: bucket,
      objectName: objectName,
    };
    const deleteObjectResponse = ''//await client.deleteObject(deleteObjectRequest);
    console.log('Delete Object executed successfully' + deleteObjectResponse);
  } catch (error) {
    console.log(error);
  }
}
