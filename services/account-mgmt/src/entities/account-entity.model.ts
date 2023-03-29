import {Entity, model, property} from '@loopback/repository';
import {UserRole} from '../models';

@model({
  settings: {
    // add it to the model definition
    mongodb: {collection: 'accounts'},
  },
})
export class AccountEntity extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  accountId: string;

  @property({
    type: 'string',
  })
  organizationId?: string;

  @property({
    type: 'string',
    required: true,
  })
  firstName: string;
  
  @property({
    type: 'string',
    required: true,
  })
  lastName: string;


  //update
  @property({
    type: 'string',
  })
  industry: string;

  @property({
    type: 'string',
  })
  companySize: string;
  
  @property({
    type: 'string',
    required: true,
  })
  emailAddress: string;

  @property({
    type: 'string',
  })
  phoneNumber?: string;

  @property({
    type: 'string',
    required: true,
  })
  jobPosition: string;

  @property({
    type: 'string',
    required: true,
  })
  userRole: UserRole;

  @property({
    type: 'boolean',
    required: true,
  })
  active: boolean;

  @property({
    type: 'boolean',
    required: true,
  })
  verified: boolean;

  @property({
    type: 'string',
    required: false,
  })
  picture: string;

  constructor(data?: Partial<AccountEntity>) {
    super(data);
  }
}

export interface AccountEntityRelations {
  // describe navigational properties here
}

export type AccountEnitityWithRelations = AccountEntity &
  AccountEntityRelations;
