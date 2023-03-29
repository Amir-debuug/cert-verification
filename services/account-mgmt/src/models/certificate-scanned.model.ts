import {model, property} from '@loopback/repository';

/**
 * The model class is generated from OpenAPI schema - certificateScanned
 * Scanned certificate details
 */
@model({name: 'certificateScanned'})
export class CertificateScanned {
  constructor(data?: Partial<CertificateScanned>) {
    if (data != null && typeof data === 'object') {
      Object.assign(this, data);
    }
  }

  /**
   * Id of certificate
   */
  @property({
    required: true,
    jsonSchema: {
      type: 'string',
      description: 'Id of certificate',
    },
  })
  certificateId: string;

  /**
   * Identification of sample
   */
  @property({
    required: true,
    jsonSchema: {
      type: 'string',
      description: 'Identification of sample',
    },
  })
  sampleId: string;

  /**
   * Identification (number) of lot
   */
  @property({
    jsonSchema: {
      type: 'string',
      description: 'Identification (number) of lot',
    },
  })
  lotNumber?: string;

  /**
   * Scanned at ISO date/time
   */
  @property({
    required: true,
    jsonSchema: {
      type: 'string',
      description: 'Scanned at ISO date/time',
    },
  })
  scannedAt: string;
}

export interface CertificateScannedRelations {
  // describe navigational properties here
}

export type CertificateScannedWithRelations = CertificateScanned &
  CertificateScannedRelations;
