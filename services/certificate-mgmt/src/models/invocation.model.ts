import {model, property} from '@loopback/repository';

/**
 * The model class is generated from OpenAPI schema - invocation
 * Details of invocation transaction
 */
@model({name: 'invocation'})
export class Invocation {
  constructor(data?: Partial<Invocation>) {
    if (data != null && typeof data === 'object') {
      Object.assign(this, data);
    }
  }

  /**
   *
   */
  @property({required: true, jsonSchema: {
  type: 'string',
  minLength: 3,
}})
  chaincode: string;

  /**
   *
   */
  @property.array(String, {jsonSchema: {
  type: 'array',
  minItems: 1,
  items: {
    type: 'string',
  },
}})
  args: string[];

  /**
   *
   */
  @property({jsonSchema: {
  type: 'object',
  properties: {
    param0: {
      type: 'string',
    },
  },
}})
  transientMap?: {
  param0?: string;
};

  /**
   *
   */
  @property({required: true, jsonSchema: {
  type: 'integer',
  default: 60000,
}})
  timeout: number = 60000;

  /**
   *
   */
  @property({required: true, jsonSchema: {
  type: 'boolean',
  default: true,
}})
  sync: boolean = true;

}

export interface InvocationRelations {
  // describe navigational properties here
}

export type InvocationWithRelations = Invocation & InvocationRelations;


