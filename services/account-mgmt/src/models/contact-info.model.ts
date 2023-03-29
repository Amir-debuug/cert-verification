import {model, property} from '@loopback/repository';

/**
 * The model class is generated from OpenAPI schema - contactInfo
 * Contract info details
 */
@model({name: 'contactInfo'})
export class ContactInfo {
  constructor(data?: Partial<ContactInfo>) {
    if (data != null && typeof data === 'object') {
      Object.assign(this, data);
    }
  }

  /**
   * General email address
   */
  @property({required: true, jsonSchema: {
  type: 'string',
  format: 'email',
  description: 'General email address',
}})
  emailAddress: string;

  /**
   * General telephone number
   */
  @property({jsonSchema: {
  type: 'string',
  pattern: '^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$',
  description: 'General telephone number',
}})
  phoneNumber?: string;

  /**
   * General fax number
   */
  @property({jsonSchema: {
  type: 'string',
  pattern: '^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$',
  description: 'General fax number',
}})
  faxNumber?: string;

  /**
   * URL of company website
   */
  @property({jsonSchema: {
  type: 'string',
  format: 'uri',
  description: 'URL of company website',
}})
  website?: string;

}

export interface ContactInfoRelations {
  // describe navigational properties here
}

export type ContactInfoWithRelations = ContactInfo & ContactInfoRelations;


