import {model, property} from '@loopback/repository';

/**
 * The model class is generated from OpenAPI schema - signature
 * Device signature object structure used in header
 */
@model({name: 'signature'})
export class Signature {
  constructor(data?: Partial<Signature>) {
    if (data != null && typeof data === 'object') {
      Object.assign(this, data);
    }
  }

  /**
   * Unique id of device
   */
  @property({required: true, jsonSchema: {
  type: 'string',
  description: 'Unique id of device',
}})
  uniqueId: string;

  /**
   * User agent of browser
   */
  @property({required: true, jsonSchema: {
  type: 'string',
  description: 'User agent of browser',
}})
  userAgent: string;

  /**
   * IP Address of device
   */
  @property({required: true, jsonSchema: {
  type: 'string',
  format: 'ipv4',
  description: 'IP Address of device',
}})
  ipAddress: string;

}

export interface SignatureRelations {
  // describe navigational properties here
}

export type SignatureWithRelations = Signature & SignatureRelations;


