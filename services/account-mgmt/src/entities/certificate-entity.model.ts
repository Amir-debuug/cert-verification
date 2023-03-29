import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {
    // add it to the model definition
    mongodb: {collection: 'certificates'},
  },
})
export class CertificateEntity extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  certificateId: string;

  @property({
    type: 'string',
    required: true,
  })
  issuerId: string;

  @property({
    type: 'string',
  })
  issuerName?: string;

  @property({
    type: 'string',
    required: true,
  })
  ownerId: string;

  @property({
    type: 'string',
  })
  ownerName?: string;

  @property({
    type: 'string',
    required: true,
  })
  requesterId: string;

  @property({
    type: 'string',
  })
  requesterName?: string;

  @property({
    type: 'string',
    required: true,
  })
  sampleId: string;

  @property({
    type: 'string',
  })
  lotNumber?: string;

  @property({
    type: 'string',
    required: true,
  })
  product: string;

  @property({
    type: 'string',
    required: true,
  })
  category: 'Food' | 'Product Testing' | 'Other' = 'Food';

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

  constructor(data?: Partial<CertificateEntity>) {
    super(data);
  }
}

export interface CertificateEntityRelations {
  // describe navigational properties here
}

export type CertificateEntityWithRelations = CertificateEntity &
  CertificateEntityRelations;
