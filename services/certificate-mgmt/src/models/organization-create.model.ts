import {model, property} from '@loopback/repository';
import {AccountInitial} from './account-initial.model';
import {OrganizationInitial} from './organization-initial.model';

/**
 * The model class is generated from OpenAPI schema - organizationCreate
 * Organization creation details
 */
@model({name: 'organizationCreate'})
export class OrganizationCreate {
  constructor(data?: Partial<OrganizationCreate>) {
    if (data != null && typeof data === 'object') {
      Object.assign(this, data);
    }
  }

  /**
   *
   */
  @property({
    required: true,
    jsonSchema: {
      $ref: '#/components/schemas/organizationInitial',
    },
  })
  organization: OrganizationInitial;

  /**
   *
   */
  @property.array(String, {
    jsonSchema: {
      type: 'array',
      items: {
        $ref: '#/components/schemas/accountInitial',
      },
    },
  })
  accounts?: AccountInitial[];
}

export interface OrganizationCreateRelations {
  // describe navigational properties here
}

export type OrganizationCreateWithRelations = OrganizationCreate &
  OrganizationCreateRelations;
