import {model, property} from '@loopback/repository';
import {AuthToken} from './auth-token.model';

/**
 * The model class is generated from OpenAPI schema - authResult
 * Authentication result details
 */
@model({name: 'authResult'})
export class AuthResult {
  constructor(data?: Partial<AuthResult>) {
    if (data != null && typeof data === 'object') {
      Object.assign(this, data);
    }
  }

  /**
   * Authorization token
   */
  @property({required: true, jsonSchema: {
  $ref: '#/components/schemas/authToken',
}})
  token: AuthToken;

}

export interface AuthResultRelations {
  // describe navigational properties here
}

export type AuthResultWithRelations = AuthResult & AuthResultRelations;


