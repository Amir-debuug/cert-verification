import {model, property} from '@loopback/repository';

/**
 * The model class is generated from OpenAPI schema - organizationUpdate
 * Update organization details
 */
@model({name: 'organizationUpdate'})
export class OrganizationUpdate {
  constructor(data?: Partial<OrganizationUpdate>) {
    if (data != null && typeof data === 'object') {
      Object.assign(this, data);
    }
  }

  /**
   * Profile picture of organization
   */
  @property({
    jsonSchema: {
      type: 'string',
      description: 'Profile picture of organization',
    },
  })
  picture?: string;

  /**
   * Indication organization is verified
   */
  @property({
    jsonSchema: {
      type: 'boolean',
      description: 'Indication organization is verified',
    },
  })
  verified?: boolean;

  /**
   * Indication organization is active
   */
  @property({
    jsonSchema: {
      type: 'boolean',
      description: 'Indication organization is active',
    },
  })
  active?: boolean;
}

export interface OrganizationUpdateRelations {
  // describe navigational properties here
}

export type OrganizationUpdateWithRelations = OrganizationUpdate &
  OrganizationUpdateRelations;
