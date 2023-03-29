import {model, property} from '@loopback/repository';
import {OrganizationId} from './organization-id.model';

/**
 * The model class is generated from OpenAPI schema - assignedorganization
 * Assigned organization details
 */
@model({name: 'assignedOrganization'})
export class AssignedOrganization {
  constructor(data?: Partial<AssignedOrganization>) {
    if (data != null && typeof data === 'object') {
      Object.assign(this, data);
    }
  }

  /**
   * ID of organization
   */
  @property({
    required: true,
    jsonSchema: {
      $ref: '#/components/schemas/organizationId',
    },
  })
  organizationId: OrganizationId;

  /**
   * Name of organization
   */
  @property({
    jsonSchema: {
      type: 'string',
      description: 'Name of organization',
    },
  })
  name?: string;

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
}

export interface AssignedOrganizationRelations {
  // describe navigational properties here
}

export type AssignedOrganizationWithRelations = AssignedOrganization &
  AssignedOrganizationRelations;
