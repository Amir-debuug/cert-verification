import {model, property} from '@loopback/repository';
import {CertificateId} from './certificate-id.model';

/**
 * The model class is generated from OpenAPI schema - certificateResult
 * Certificate result details
 */
@model({name: 'certificateResult'})
export class CertificateResult {
  constructor(data?: Partial<CertificateResult>) {
    if (data != null && typeof data === 'object') {
      Object.assign(this, data);
    }
  }

  /**
   * ID of certificate
   */
  @property({required: true, jsonSchema: {
  $ref: '#/components/schemas/certificateId',
}})
  certificateId: CertificateId;

}

export interface CertificateResultRelations {
  // describe navigational properties here
}

export type CertificateResultWithRelations = CertificateResult & CertificateResultRelations;


