import {model, property} from '@loopback/repository';

/**
 * The model class is generated from OpenAPI schema - accountUpdate
 * Update account details
 */
@model({name: 'accountUpdateProfile'})
export class AccountUpdateProfile {
  constructor(data?: Partial<AccountUpdateProfile>) {
    if (data != null && typeof data === 'object') {
      Object.assign(this, data);
    }
  }
    /**
 * Profile picture of organization
 */
    @property({
      jsonSchema: {
        type: 'string',
        description: 'Profile picture of organization',
      },
    })
    picture?: string;

}

export interface AccountUpdateProfileRelations {
  // describe navigational properties here
}

export type AccountUpdateProfileWithRelations = AccountUpdateProfile & AccountUpdateProfileRelations;


