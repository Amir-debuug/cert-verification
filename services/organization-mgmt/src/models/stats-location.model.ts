import {model, property} from '@loopback/repository';

/**
 * The model class is generated from OpenAPI schema - statsLocation
 * Location statistics
 */
@model({name: 'statsLocation'})
export class StatsLocation {
  constructor(data?: Partial<StatsLocation>) {
    if (data != null && typeof data === 'object') {
      Object.assign(this, data);
    }
  }

  /**
   * Amount of active users
   */
  @property({required: true, jsonSchema: {
  type: 'integer',
  description: 'Amount of active users',
}})
  activeUsers: number;

  /**
   * Name of the city
   */
  @property({required: true, jsonSchema: {
  type: 'string',
  description: 'Name of the city',
}})
  city: string;

  /**
   * Name of the country
   */
  @property({required: true, jsonSchema: {
  type: 'string',
  description: 'Name of the country',
}})
  country: string;

}

export interface StatsLocationRelations {
  // describe navigational properties here
}

export type StatsLocationWithRelations = StatsLocation & StatsLocationRelations;


