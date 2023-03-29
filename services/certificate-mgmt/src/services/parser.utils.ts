import {AnyObject, Where, WhereBuilder} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {createHash} from 'crypto';
import {Base64} from 'js-base64';
import {UAParser} from 'ua-parser-js';
import {PageLinks} from '../models/page-links.model';
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

export function generateHashes(names: string[]): string[] {
  const hashes: string[] = [];
  names.forEach(name => {
    hashes.push(generateHash(name));
  });
  return hashes;
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

export function createWhereClause(filter?: string): Where {
  if (filter) {
    let whereBuilder = new WhereBuilder<AnyObject>({});
    const conditions = filter.split(',');
    conditions.forEach(cond => {
      const fields = cond.split(':');
      if (fields[1] !== 'like') {
        whereBuilder = whereBuilder.impose({
          [fields[0]]: {[fields[1]]: fields[2]},
        });
      } else {
        const pattern = new RegExp('^' + fields[2] + '.*', 'i');
        whereBuilder = whereBuilder.impose({
          [fields[0]]: {like: pattern},
        });
      }
    });
    const where = whereBuilder.build();

    return where;
  }
  return;
}

export function createOrderClause(order?: string): string[] {
  if (order) {
    const orderClause: string[] = [];
    const conditions = order.split(',');
    conditions.forEach(cond => {
      const fields = cond.split(':');
      orderClause.push(`${fields[1]} ${fields[0].toUpperCase()}`);
    });

    return orderClause;
  }
  return;
}

export interface LinksCreate {
  base: string;
  total: number;
  filter?: string;
  sort?: string;
  offset?: number;
  limit?: number;
}

export function determineLinks(lc: LinksCreate): PageLinks {
  return {
    self: determineLink('self', lc),
    first: determineLink('first', lc),
    prev: determineLink('prev', lc),
    next: determineLink('next', lc),
    last: determineLink('last', lc),
  };
}

function determineLink(type: string, lc: LinksCreate): string {
  let link: string = lc.base;
  if (lc.filter || lc.sort || lc.offset || lc.limit) {
    link = link.concat(`?link=${type}`);
    if (lc.filter) {
      link = link.concat(`&filter=${lc.filter}`);
    }
    if (lc.sort) {
      link = link.concat(`&sort=${lc.sort}`);
    }
    if (lc.limit) {
      const limit = lc.limit;
      const total = lc.total;
      let offset = lc.offset;
      if (type === 'last') {
        offset = total - limit < 0 ? 0 : total - limit;
      }

      if (offset !== undefined) {
        if (type === 'next') {
          if (total - offset > offset) {
            offset = offset += limit;
          } else {
            return;
          }
        } else if (type === 'prev') {
          if (offset > 0 && offset >= limit) {
            offset = offset - limit;
          }
          if (offset === 0) {
            return;
          }
        } else if (type === 'first') {
          offset = 0;
        }

        link = link.concat(`&offset=${offset}`);
      }

      link = link.concat(`&limit=${limit}`);
    } else {
      if (type === 'prev' || type === 'next') {
        return;
      }
    }
  }

  return link;
}
