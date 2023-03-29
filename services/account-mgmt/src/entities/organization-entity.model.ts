import {Entity, model, property} from '@loopback/repository';
import {Address, ContactInfo} from '../models';

@model({
  settings: {
    // add it to the model definition
    mongodb: {collection: 'organizations'},
  },
})
export class OrganizationEntity extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  organizationId: string;

  @property({
    type: 'string',
  })
  customerId?: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
  })
  picture?: string;

  @property({
    type: 'object',
    required: true,
  })
  address: Address;

  @property({
    type: 'array',
    itemType: 'string',
  })
  industryCategory?: string[];

  @property({
    type: 'object',
    required: true,
  })
  contactInfo: ContactInfo;

  @property({
    type: 'boolean',
    required: true,
  })
  active: boolean;

  @property({
    type: 'boolean',
    required: true,
  })
  verified: boolean;

  constructor(data?: Partial<OrganizationEntity>) {
    super(data);
  }
}

export interface OrganizationEntityRelations {
  // describe navigational properties here
}

export type OrganizationEntityWithRelations = OrganizationEntity &
  OrganizationEntityRelations;
