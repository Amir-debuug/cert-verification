import {model, property} from '@loopback/repository';
import {AssignedAccount} from './assigned-account.model';
import {AssignedOrganization} from './assigned-organization.model';

/**
 * The model class is generated from OpenAPI schema - certificateInitial
 * Initial certificate details
 */
@model({name: 'certificateInitial'})
export class CertificateInitial {
  constructor(data?: Partial<CertificateInitial>) {
    if (data != null && typeof data === 'object') {
      Object.assign(this, data);
    }
  }

  /**
   * Assigned organization details
   */
  @property({
    required: true,
    jsonSchema: {
      $ref: '#/components/schemas/assignedorganization',
    },
  })
  organization: AssignedOrganization;

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
   * Name of certified product
   */
  @property({
    required: true,
    jsonSchema: {
      type: 'string',
      description: 'Name of certified product',
    },
  })
  product: string;

  /**
   * Product category
   */
  @property({
    required: true,
    jsonSchema: {
      type: 'string',
      enum: ['Food', 'Product Testing', 'Other'],
      description: 'Product category',
      default: 'Food',
    },
  })
  category: 'Food' | 'Product Testing' | 'Other' = 'Food';

  /**
   * Assigned account details
   */
  @property({
    required: true,
    jsonSchema: {
      $ref: '#/components/schemas/assignedAccount',
    },
  })
  requestedBy: AssignedAccount;
}

export interface CertificateInitialRelations {
  // describe navigational properties here
}

export type CertificateInitialWithRelations = CertificateInitial &
  CertificateInitialRelations;
