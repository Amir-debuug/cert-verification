import {model, property} from '@loopback/repository';

/**
 * The model class is generated from OpenAPI schema - serviceError
 * Service error details
 */
@model({name: 'serviceError'})
export class ServiceError {
  constructor(data?: Partial<ServiceError>) {
    if (data != null && typeof data === 'object') {
      Object.assign(this, data);
    }
  }

  /**
   *
   */
  @property({jsonSchema: {
  type: 'object',
  properties: {
    statusCode: {
      type: 'integer',
      description: 'The status code as a number',
    },
    name: {
      type: 'string',
      description: 'The name of the error as a "bumpy case", i.e. NotFound or  internalServerError.',
    },
    message: {
      type: 'string',
      description: 'The traditional error message, which should be kept short and  all single line',
    },
    code: {
      type: 'string',
      description: 'The application error code',
    },
    details: {
      type: 'array',
      items: {
        type: 'object',
      },
      description: 'The application error details',
    },
  },
  required: [
    'statusCode',
    'name',
  ],
}})
  error?: {
  statusCode: number;
  name: string;
  message?: string;
  code?: string;
  details?: {
  
}[];
};

}

export interface ServiceErrorRelations {
  // describe navigational properties here
}

export type ServiceErrorWithRelations = ServiceError & ServiceErrorRelations;


