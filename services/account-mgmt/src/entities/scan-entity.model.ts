import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {
    // add it to the model definition
    mongodb: {collection: 'scans'},
  },
})
export class ScanEntity extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  scanId: string;

  @property({
    type: 'string',
    required: true,
  })
  certificateId: string;

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
  })
  accountId?: string;

  @property({
    type: 'string',
  })
  city: string;

  @property({
    type: 'string',
    required: true,
  })
  country: string;

  @property({
    type: 'string',
    required: true,
  })
  scannedAt: string;

  constructor(data?: Partial<ScanEntity>) {
    super(data);
  }
}

export interface ScanEntityRelations {
  // describe navigational properties here
}

export type ScanEntityWithRelations = ScanEntity & ScanEntityRelations;
