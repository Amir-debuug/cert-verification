import {model, property} from '@loopback/repository';

/**
 * The model class is generated from OpenAPI schema - accountUpdate
 * Update account details
 */
@model({name: 'accountUpdate'})
export class AccountUpdate {
  constructor(data?: Partial<AccountUpdate>) {
    if (data != null && typeof data === 'object') {
      Object.assign(this, data);
    }
  }

  /**
   * Indication account is verified
   */
  @property({jsonSchema: {
  type: 'boolean',
  description: 'Indication account is verified',
}})
  verified?: boolean;

  /**
   * Indication account is active
   */
  @property({jsonSchema: {
  type: 'boolean',
  description: 'Indication account is active',
}})
  active?: boolean;

}

export interface AccountUpdateRelations {
  // describe navigational properties here
}

export type AccountUpdateWithRelations = AccountUpdate & AccountUpdateRelations;


