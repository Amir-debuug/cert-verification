import {model, property} from '@loopback/repository';

/**
 * The model class is generated from OpenAPI schema - result
 * result
 */
@model({name: 'result'})
export class Result {
  constructor(data?: Partial<Result>) {
    if (data != null && typeof data === 'object') {
      Object.assign(this, data);
    }
  }

  /**
   *
   */
  @property({jsonSchema: {
  type: 'string',
}})
  txid?: string;

  /**
   *
   */
  @property({jsonSchema: {
  anyOf: [
    {
      type: 'string',
    },
    {
      type: 'object',
    },
  ],
}})
  payload?: string | {
  
};

  /**
   *
   */
  @property({jsonSchema: {
  type: 'string',
}})
  encode?: string;

}

export interface ResultRelations {
  // describe navigational properties here
}

export type ResultWithRelations = Result & ResultRelations;


