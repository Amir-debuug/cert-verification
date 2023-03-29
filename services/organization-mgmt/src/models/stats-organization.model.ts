import {model, property} from '@loopback/repository';
import {StatsLocation} from './stats-location.model';

/**
 * The model class is generated from OpenAPI schema - statsorganization
 * organization statistics
 */
@model({name: 'statsOrganization'})
export class StatsOrganization {
  constructor(data?: Partial<StatsOrganization>) {
    if (data != null && typeof data === 'object') {
      Object.assign(this, data);
    }
  }


  /**
   *
   */
  @property.array(StatsLocation, {
    jsonSchema: {
      type: 'array',
      items: {
        $ref: '#/components/schemas/statsLocation',
      },
    },
  })
  locations?: StatsLocation[];
}

export interface StatsOrganizationRelations {
  // describe navigational properties here
}

export type StatsOrganizationWithRelations = StatsOrganization &
  StatsOrganizationRelations;
