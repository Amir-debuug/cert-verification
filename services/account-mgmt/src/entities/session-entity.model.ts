import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {
    // add it to the model definition
    mongodb: {collection: 'sessions'},
  },
})
export class SessionEntity extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  sessionId: string;

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
  signatureHash: string;

  @property({
    type: 'string',
  })
  organizationId?: string;

  @property({
    type: 'string',
  })
  authCode?: string;

  @property({
    type: 'date',
    required: true,
  })
  expireAt: Date;

  constructor(data?: Partial<SessionEntity>) {
    super(data);
  }
}

export interface SessionEntityRelations {
  // describe navigational properties here
}

export type SessionEntityWithRelations = SessionEntity & SessionEntityRelations;
