import {model, property} from '@loopback/repository';
import {Result} from './result.model';

/**
 * The model class is generated from OpenAPI schema - invocationResult
 * invocationResult
 */
@model({name: 'invocationResult'})
export class InvocationResult {
  constructor(data?: Partial<InvocationResult>) {
    if (data != null && typeof data === 'object') {
      Object.assign(this, data);
    }
  }

  /**
   *
   */
  @property({required: true, jsonSchema: {
  type: 'string',
  enum: [
    'Success',
    'Failure',
  ],
}})
  returnCode: 'Success' | 'Failure';

  /**
   *
   */
  @property({required: true, jsonSchema: {
  type: 'string',
}})
  error: string;

  /**
   *
   */
  @property({jsonSchema: {
  $ref: '#/components/schemas/result',
}})
  result?: Result;

}

export interface InvocationResultRelations {
  // describe navigational properties here
}

export type InvocationResultWithRelations = InvocationResult & InvocationResultRelations;


