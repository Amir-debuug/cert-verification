import {Model, model, property} from '@loopback/repository';

@model()
export class AccountIds extends Model {
  @property({
    type: 'string',
    required: true,
  })
  accountId: string;

  @property({
    type: 'string',
  })
  organizationId?: string;

  constructor(data?: Partial<AccountIds>) {
    super(data);
  }
}

export interface AccountIdsRelations {
  // describe navigational properties here
}

export type AccountIdsWithRelations = AccountIds & AccountIdsRelations;
