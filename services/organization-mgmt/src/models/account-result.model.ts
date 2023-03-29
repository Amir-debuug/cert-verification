import {model, property} from '@loopback/repository';
import {AccountId} from './account-id.model';

/**
 * The model class is generated from OpenAPI schema - accountResult
 * Account result details
 */
@model({name: 'accountResult'})
export class AccountResult {
  constructor(data?: Partial<AccountResult>) {
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

}

export interface AccountResultRelations {
  // describe navigational properties here
}

export type AccountResultWithRelations = AccountResult & AccountResultRelations;


