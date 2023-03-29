import {model, property} from '@loopback/repository';
import {UserRole} from './user-role.model';

/**
 * The model class is generated from OpenAPI schema - TokenPayload
 * TokenPayload
 */
@model({name: 'TokenPayload'})
export class TokenPayload {
  constructor(data?: Partial<TokenPayload>) {
    if (data != null && typeof data === 'object') {
      Object.assign(this, data);
    }
  }

  /**
   * Name of service provider
   */
  @property({required: true})
  iss: string;

  /**
   * Subject (account id)
   */
  @property({required: true})
  sub: string;

  /**
   * Session id
   */
  @property({required: true})
  ses: string;

  /**
   * Id of organization (optional)
   */
  @property()
  org?: string;

  /**
   * Unique id of device
   */
  @property({required: true})
  dev: string;

  /**
   * Role of user
   */
  @property({required: true})
  role: UserRole;

  /**
   * Expire after time
   */
  @property({required: true})
  exp: number;

  /**
   * Initiated at time
   */
  @property()
  iat?: number;
}
