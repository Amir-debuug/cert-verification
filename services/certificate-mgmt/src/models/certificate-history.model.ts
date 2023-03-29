import {model, property} from '@loopback/repository';

/**
 * The model class is generated from OpenAPI schema - certificateHistory
 * Certificate history details
 */
@model({name: 'certificateHistory'})
export class CertificateHistory {
  constructor(data?: Partial<CertificateHistory>) {
    if (data != null && typeof data === 'object') {
      Object.assign(this, data);
    }
  }

  /**
   *
   */
  @property({
    jsonSchema: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Name of signer',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Emailaddress of signer',
          },
          organization: {
            type: 'string',
            description: 'organization the signer belongs to',
          },
          signedOn: {
            type: 'string',
            format: 'date-time',
            description: 'Date and time of signing certificate',
          },
        },
        required: ['name', 'email', 'organization', 'signedOn'],
      },
    },
  })
  signers?: {
    name: string;
    email: string;
    organization: string;
    signedOn: Date;
  }[];

  /**
   *
   */
  @property({
    jsonSchema: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        properties: {
          transactionId: {
            type: 'string',
            description: 'Id of transaction (blockchain txID)',
          },
          title: {
            type: 'string',
            description: 'Title of recorded transaction',
          },
          description: {
            type: 'string',
            description: 'Description of recorded transaction',
          },
        },
        required: ['transactionId', 'title', 'description'],
      },
    },
  })
  transactions?: {
    transactionId: string;
    title: string;
    description: string;
  }[];
}

export interface CertificateHistoryRelations {
  // describe navigational properties here
}

export type CertificateHistoryWithRelations = CertificateHistory &
  CertificateHistoryRelations;
