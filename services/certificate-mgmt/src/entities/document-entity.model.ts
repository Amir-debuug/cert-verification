import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {
    // add it to the model definition
    mongodb: {collection: 'documents'},
  },
})
export class DocumentEntity extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  documentId: string;

  @property({
    type: 'string',
    required: true,
  })
  folderName: string;
  
  @property({
    type: 'string',
    required: true,
  })
  ownerId: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  status: 'sent' | 'signed' | 'revoked';

  @property({
    type: 'string',
    required: true,
  })
  requestedAt: string;

  @property({
    type: 'string',
  })
  validUntil?: string;

  @property({
    type: 'string',
  })
  attachmentLink?: string;

  @property({
    type: 'string',
  })
  attachmentHash?: string;

  @property({
    type: 'string',
  })
  txHash?: string;

  @property({
    type: 'string',
  })
  blockHash?: string;

  @property({
    type: 'string',
    required: true,
  })
  createdAt: string;

  constructor(data?: Partial<DocumentEntity>) {
    super(data);
  }
}

export interface DocumentEntityRelations {
  // describe navigational properties here
}

export type DocumentEntityWithRelations = DocumentEntity &
  DocumentEntityRelations;
