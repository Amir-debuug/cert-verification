import {model, property} from '@loopback/repository';
import {AccountId} from './account-id.model';

/**
 * The model class is generated from OpenAPI schema - signer
 * Signer details
 */
@model({name: 'signer'})
export class Signer {
  constructor(data?: Partial<Signer>) {
    if (data != null && typeof data === 'object') {
      Object.assign(this, data);
    }
  }

  /**
   * ID of account
   */
  @property({jsonSchema: {
  $ref: '#/components/schemas/accountId',
}})
  accountId?: AccountId;

  /**
   * Name of account / user / signer
   */
  @property({required: true, jsonSchema: {
  type: 'string',
  description: 'Name of account / user / signer',
}})
  name: string;

  /**
   * Email address of signer
   */
  @property({required: true, jsonSchema: {
  type: 'string',
  format: 'email',
  description: 'Email address of signer',
}})
  emailAddress: string;

}

export interface SignerRelations {
  // describe navigational properties here
}

export type SignerWithRelations = Signer & SignerRelations;


