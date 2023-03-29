import {HttpErrors} from '@loopback/rest';
import {createHash} from 'crypto';
import {Base64} from 'js-base64';
import {UAParser} from 'ua-parser-js';
import {Signature} from '../models/signature.model';

export function validateSignature(signatureHash: string): void {
  try {
    // Check on missing signature
    if (signatureHash === null || signatureHash.length === 0) {
      throw new Error('missing signature hash');
    }
    // Check if signatureHash is valid JSON
    if (!isJson(Base64.decode(signatureHash))) {
      throw new Error('invalid signature payload');
    }
  } catch (error) {
    throw new HttpErrors.UnprocessableEntity(`Signature is invalid. ${error}`);
  }
}

export function encodeBase64(value: string): string {
  return Base64.encode(value);
}

export function decodeBase64(value: string): string {
  return Base64.decode(value);
}

export function parseSignature(signatureHash: string): Signature {
  try {
    const signature: Signature = JSON.parse(Base64.decode(signatureHash));
    const req = ['uniqueId', 'userAgent', 'ipAddress'];
    if (!(Object.keys(signature).indexOf('uniqueId') > -1)) {
      throw new Error(`missing required key 'uniqueId'`);
    }
    Object.keys(signature).forEach(function (key) {
      if (!req.includes(key)) throw new Error(`found unknown key '${key}'`);
    });
    return signature;
  } catch (error) {
    throw new HttpErrors.UnprocessableEntity(`Signature is invalid. ${error}`);
  }
}

export function parseUserAgent(userAgent: string): string {
  const uap = new UAParser(userAgent);
  const dc = uap.getDevice();
  const os = uap.getOS();
  return dc.vendor + ' ' + dc.model + ' [' + os.name + ' ' + os.version + ']';
}

export function generateHash(...params: string[]): string {
  let stringToHash = '';
  for (const item of params) {
    stringToHash = stringToHash.concat(item);
  }

  const hashObj = createHash('RIPEMD160');
  hashObj.update(stringToHash);
  const hashId = hashObj.digest('hex');

  return hashId;
}

export function isJson(item: string): boolean {
  item = typeof item !== 'string' ? JSON.stringify(item) : item;

  try {
    item = JSON.parse(item);
  } catch (error) {
    return false;
  }

  return typeof item === 'object' && item !== null;
}

export function calcExpireDate(days: number): number {
  const expDate = new Date();
  expDate.setDate(expDate.getDate() + days);
  return expDate.getTime();
}

export function generateAuthCode(length = 8): string {
  return Math.random()
    .toString(36)
    .substring(2, length + 2)
    .toUpperCase();
}
