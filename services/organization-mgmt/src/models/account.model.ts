import {AccountId} from './account-id.model';
import {AccountInitial} from './account-initial.model';
import {OrganizationId} from './organization-id.model';
/**
 * The model type is generated from OpenAPI schema - account
 * Account details
 */
export type Account = {
  accountId: AccountId;
  organizationId?: OrganizationId;
} & AccountInitial & {
    verified: boolean;
    active: boolean;
  };
