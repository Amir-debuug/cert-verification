import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {
    // add it to the model definition
    mongodb: {collection: 'codes'},
  },
})
export class CodeEntity extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  codeId: string;

  @property({
    type: 'string',
    required: true,
  })
  deviceId: string;

  @property({
    type: 'string',
    required: true,
  })
  accountId: string;

  @property({
    type: 'string',
    required: true,
  })
  userAgent: string;

  @property({
    type: 'string',
    required: true,
  })
  authCode: string;

  @property({
    type: 'boolean',
    required: true,
    default: false,
  })
  firstTime: boolean;

  constructor(data?: Partial<CodeEntity>) {
    super(data);
  }
}

export interface CodeEntityRelations {
  // describe navigational properties here
}

export type CodeEntityWithRelations = CodeEntity & CodeEntityRelations;
