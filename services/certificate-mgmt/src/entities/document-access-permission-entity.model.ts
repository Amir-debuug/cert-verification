import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {
    // add it to the model definition
    mongodb: {collection: 'documentAccessPermission'},
  },
})
export class DocumentAccessPermissionEntity extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: false,
  })
  permissionId: string;

  @property({
    type: 'string',
    required: true,
  })
  documentId: string;

  @property({
    type: 'string',
    required: true,
  })
  accountId: string;

  @property({
    type: 'string',
    required: true,
  })
  accessLevel: 'owner'|'viewer'|'partner';

  @property({
    type: 'string',
    required: true,
  })
  createdAt: string;

  constructor(data?: Partial<DocumentAccessPermissionEntity>) {
    super(data);
  }
}

export interface DocumentAccessPermissionRelations {
  // describe navigational properties here
}

export type DocumentAccessPermissionEntityWithRelations = DocumentAccessPermissionEntity & DocumentAccessPermissionRelations;
