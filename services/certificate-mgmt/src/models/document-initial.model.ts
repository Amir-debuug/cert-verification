import {model, property} from '@loopback/repository';

/**
 * The model class is generated from OpenAPI schema - documentInitial
 * Inital document details
 */
@model({name: 'documentInitial'})
export class DocumentInitial {
  constructor(data?: Partial<DocumentInitial>) {
    if (data != null && typeof data === 'object') {
      Object.assign(this, data);
    }
  }

  /**
   * Name of document
   */
  @property({
    required: true,
    jsonSchema: {
      type: 'string',
      description: 'Name of document',
    },
  })
  name: string;

  /**
   * Folder name - default value will be the category name 
   */
  @property({
    required: true,
    jsonSchema: {
      type: 'string',
      description: 'Food testing certificates',
      default: 'Food',
    },
  })
  folderName: string;
  
  /**
   * Content/preview of uploaded file (required on post operation)
   */
  @property({
    jsonSchema: {
      type: 'string',
      description:
        'Content/preview of uploaded file (required on post operation)',
    },
  })
  fileContent?: string;

  /**
   * Id of report
   */
  @property({
    required: true,
    jsonSchema: {
      type: 'string',
      description: 'Id of report',
    },
  })
  ownerId: string;

  /**
   *
   */
  @property({
    required: true,
    jsonSchema: {
      type: 'string',
      enum: ['sent', 'signed', 'revoked'],
      default: 'sent',
    },
  })
  status: 'sent' | 'signed' | 'revoked' = 'sent';

  /**
   * Certificate requested at ISO datetime (default sysdate)
   */
  @property({
    jsonSchema: {
      type: 'string',
      format: 'date-time',
      description: 'Certificate requested at ISO datetime (default sysdate)',
    },
  })
  requestedAt?: Date;

  /**
   * Certificate valid until ISO datetime (default 3 months)
   */
  @property({
    jsonSchema: {
      type: 'string',
      format: 'date-time',
      description: 'Certificate valid until ISO datetime (default 3 months)',
    },
  })
  validUntil?: Date;

  @property({
    jsonSchema: {
      type: 'number',
      description: 'signer counts',
    },
  })
  singersCount?: Number;
}

export interface DocumentInitialRelations {
  // describe navigational properties here
}

export type DocumentInitialWithRelations = DocumentInitial &
  DocumentInitialRelations;
