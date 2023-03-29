import {model, property} from '@loopback/repository';
import {AccountId} from './account-id.model';

/**
 * The model class is generated from OpenAPI schema - assignedAccount
 * Assigned account details
 */
@model({name: 'assignedAccount'})
export class AssignedAccount {
  constructor(data?: Partial<AssignedAccount>) {
    if (data != null && typeof data === 'object') {
      Object.assign(this, data);
    }
  }

  /**
   * ID of account
   */
  @property({required: true, jsonSchema: {
  $ref: '#/components/schemas/accountId',
}})
  accountId: AccountId;

  /**
   * Name of account / user / signer
   */
  @property({jsonSchema: {
  type: 'string',
  description: 'Name of account / user / signer',
}})
  name?: string;

  /**
   * Email address of signer
   */
  @property({jsonSchema: {
  type: 'string',
  format: 'email',
  description: 'Email address of signer',
}})
  emailAddress?: string;

}

export interface AssignedAccountRelations {
  // describe navigational properties here
}

export type AssignedAccountWithRelations = AssignedAccount & AssignedAccountRelations;


