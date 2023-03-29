import {model, property} from '@loopback/repository';

/**
 * The model class is generated from OpenAPI schema - statsCategory
 * Category statistics
 */
@model({name: 'statsCategory'})
export class StatsCategory {
  constructor(data?: Partial<StatsCategory>) {
    if (data != null && typeof data === 'object') {
      Object.assign(this, data);
    }
  }

  /**
   * Name of category
   */
  @property({jsonSchema: {
  type: 'string',
  description: 'Name of category',
}})
  name?: string;

  /**
   * Percentage of certificates
   */
  @property({jsonSchema: {
  type: 'integer',
  description: 'Percentage of certificates',
}})
  percentage?: number;

}

export interface StatsCategoryRelations {
  // describe navigational properties here
}

export type StatsCategoryWithRelations = StatsCategory & StatsCategoryRelations;


