import {model, property} from '@loopback/repository';

/**
 * The model class is generated from OpenAPI schema - organizationInfo
 * Organization info details
 */
@model({name: 'organizationInfo'})
export class OrganizationInfo {
  constructor(data?: Partial<OrganizationInfo>) {
    if (data != null && typeof data === 'object') {
      Object.assign(this, data);
    }
  }

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
   * Name of the country
   */
  @property({
    required: true,
    jsonSchema: {
      type: 'string',
      description: 'Name of the country',
    },
  })
  country: string;
}

export interface OrganizationInfoRelations {
  // describe navigational properties here
}

export type OrganizationInfoWithRelations = OrganizationInfo &
  OrganizationInfoRelations;
