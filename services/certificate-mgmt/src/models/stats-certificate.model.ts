import {model, property} from '@loopback/repository';
import {StatsCategory} from './stats-category.model';

/**
 * The model class is generated from OpenAPI schema - statsCertificate
 * Certificate statistics
 */
@model({name: 'statsCertificate'})
export class StatsCertificate {
  constructor(data?: Partial<StatsCertificate>) {
    if (data != null && typeof data === 'object') {
      Object.assign(this, data);
    }
  }

  /**
   * Amount of scanned certificates
   */
  @property({required: true, jsonSchema: {
  type: 'integer',
  description: 'Amount of scanned certificates',
}})
  scanned: number;

  /**
   * Amount of requested certificates
   */
  @property({required: true, jsonSchema: {
  type: 'integer',
  description: 'Amount of requested certificates',
}})
  requested: number;

  /**
   *
   */
  @property.array(StatsCategory, {jsonSchema: {
  type: 'array',
  items: {
    $ref: '#/components/schemas/statsCategory',
  },
}})
  categories?: StatsCategory[];

}

export interface StatsCertificateRelations {
  // describe navigational properties here
}

export type StatsCertificateWithRelations = StatsCertificate & StatsCertificateRelations;


