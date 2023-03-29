import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {
    // add it to the model definition
    mongodb: {collection: 'signers'},
  },
})
export class SignerEntity extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  signerId: string;

  @property({
    type: 'string',
    required: true,
  })
  certificateId: string;

  @property({
    type: 'string',
  })
  accountId?: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  emailAddress: string;

  @property({
    type: 'boolean',
    required: true,
  })
  signed: boolean;

  @property({
    type: 'string',
  })
  signedOn?: string;

  @property({
    type: 'string',
  })
  txHash?: string;

  @property({
    type: 'string',
  })
  blockHash?: string;

  constructor(data?: Partial<SignerEntity>) {
    super(data);
  }
}

export interface SignerEntityRelations {
  // describe navigational properties here
}

export type SignerEntityWithRelations = SignerEntity & SignerEntityRelations;
