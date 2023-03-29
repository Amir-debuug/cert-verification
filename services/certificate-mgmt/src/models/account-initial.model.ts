import {model, property} from '@loopback/repository';
import {UserRole} from './user-role.model';

/**
 * The model class is generated from OpenAPI schema - accountInitial
 * Initial account details
 */
@model({name: 'accountInitial'})
export class AccountInitial {
  constructor(data?: Partial<AccountInitial>) {
    if (data != null && typeof data === 'object') {
      Object.assign(this, data);
    }
  }

  /**
   * Name of account
   */
  @property({
    required: true,
    jsonSchema: {
      type: 'string',
      description: 'Name of account',
    },
  })
  name: string;

  /**
   * Email address of account
   */
  @property({
    required: true,
    jsonSchema: {
      type: 'string',
      format: 'email',
      description: 'Email address of account',
    },
  })
  emailAddress: string;

  /**
   * Mobile telephone number of account
   */
  @property({
    jsonSchema: {
      type: 'string',
      pattern: '^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$',
      description: 'Mobile telephone number of account',
    },
  })
  phoneNumber?: string;

  /**
   * Job position of account holder
   */
  @property({
    jsonSchema: {
      type: 'string',
      description: 'Job position of account holder',
    },
  })
  jobPosition: string;

  /**
   * User role enumation
   */
  @property({
    required: true,
    jsonSchema: {
      $ref: '#/components/schemas/userRole',
    },
  })
  userRole: UserRole;
}

export interface AccountInitialRelations {
  // describe navigational properties here
}

export type AccountInitialWithRelations = AccountInitial &
  AccountInitialRelations;
