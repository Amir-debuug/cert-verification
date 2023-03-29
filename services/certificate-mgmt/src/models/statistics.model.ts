import {model, property} from '@loopback/repository';
import {StatsCertificate} from './stats-certificate.model';
import {StatsOrganization} from './stats-organization.model';

/**
 * The model class is generated from OpenAPI schema - statistics
 * Statistics details
 */
@model({name: 'statistics'})
export class Statistics {
  constructor(data?: Partial<Statistics>) {
    if (data != null && typeof data === 'object') {
      Object.assign(this, data);
    }
  }

  /**
   * Certificate statistics
   */
  @property({
    jsonSchema: {
      $ref: '#/components/schemas/statsCertificate',
    },
  })
  certificates?: StatsCertificate;

  /**
   * organization statistics
   */
  @property({
    jsonSchema: {
      $ref: '#/components/schemas/statsOrganization',
    },
  })
  accounts?: StatsOrganization;

  /**
   * Documents statistics
   */
  @property({
    jsonSchema: {
      $ref: '#/components/schemas/statsDocument',
    },
  })
  documents?: [];
}

export interface StatisticsRelations {
  // describe navigational properties here
}

export type StatisticsWithRelations = Statistics & StatisticsRelations;
