import {model, property} from '@loopback/repository';
import {OrganizationId} from './organization-id.model';

/**
 * The model class is generated from OpenAPI schema - organizationResult
 * Organization result details
 */
@model({name: 'organizationResult'})
export class OrganizationResult {
  constructor(data?: Partial<OrganizationResult>) {
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
}

export interface OrganizationResultRelations {
  // describe navigational properties here
}

export type OrganizationResultWithRelations = OrganizationResult &
  OrganizationResultRelations;
