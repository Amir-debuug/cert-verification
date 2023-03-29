import {model, property} from '@loopback/repository';
import {Address} from './address.model';
import {ContactInfo} from './contact-info.model';

/**
 * The model class is generated from OpenAPI schema - organizationInitial
 * Initial organization details
 */
@model({name: 'organizationInitial'})
export class OrganizationInitial {
  constructor(data?: Partial<OrganizationInitial>) {
    if (data != null && typeof data === 'object') {
      Object.assign(this, data);
    }
  }

  /**
   * Customer reference of organization
   */
  @property({
    jsonSchema: {
      type: 'string',
      description: 'Customer reference of organization',
    },
  })
  customerId?: string;

  /**
   * Name of organization
   */
  @property({
    required: true,
    jsonSchema: {
      type: 'string',
      description: 'Name of organization',
    },
  })
  name: string;

  /**
   * Profile picture
   */
  @property({
    jsonSchema: {
      type: 'string',
      description: 'Profile picture',
    },
  })
  picture?: string;

  /**
   * Address details
   */
  @property({
    required: true,
    jsonSchema: {
      $ref: '#/components/schemas/address',
    },
  })
  address: Address;

  /**
   *
   */
  @property({
    jsonSchema: {
      type: 'array',
      items: {
        type: 'string',
        description: 'Industry the company is active in',
        enum: ['Food', 'Product Testing', 'Other'],
        default: 'Food',
      },
    },
  })
  industryCategory?: string[];

  /**
   * Contract info details
   */
  @property({
    required: true,
    jsonSchema: {
      $ref: '#/components/schemas/contactInfo',
    },
  })
  contactInfo: ContactInfo;
}

export interface OrganizationInitialRelations {
  // describe navigational properties here
}

export type OrganizationInitialWithRelations = OrganizationInitial &
  OrganizationInitialRelations;
