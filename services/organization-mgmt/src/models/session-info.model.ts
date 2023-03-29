import {Model, model, property} from '@loopback/repository';

@model()
export class SessionInfo extends Model {
  @property({
    type: 'string',
    required: true,
  })
  accountId: string;

  @property({
    type: 'string',
    required: true,
  })
  deviceId: string;

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

  constructor(data?: Partial<SessionInfo>) {
    super(data);
  }
}

export interface SessionInfoRelations {
  // describe navigational properties here
}

export type SessionInfoWithRelations = SessionInfo & SessionInfoRelations;
