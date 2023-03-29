import {model, property} from '@loopback/repository';

/**
 * The model class is generated from OpenAPI schema - address
 * Address details
 */
@model({name: 'address'})
export class Address {
  constructor(data?: Partial<Address>) {
    if (data != null && typeof data === 'object') {
      Object.assign(this, data);
    }
  }

  /**
   * Name and number of street
   */
  @property({jsonSchema: {
  type: 'string',
  description: 'Name and number of street',
}})
  streetAddress?: string;

  /**
   * Postalcode of address
   */
  @property({jsonSchema: {
  type: 'string',
  description: 'Postalcode of address',
}})
  postalCode?: string;

  /**
   * Name of city
   */
  @property({jsonSchema: {
  type: 'string',
  description: 'Name of city',
}})
  city?: string;

  /**
   * Country of address
   */
  @property({required: true, jsonSchema: {
  type: 'string',
  description: 'Country of address',
}})
  country: string;

}

export interface AddressRelations {
  // describe navigational properties here
}

export type AddressWithRelations = Address & AddressRelations;


