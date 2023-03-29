import {AccountId} from './account-id.model';
import {AccountInitial} from './account-initial.model';
import {CertificateScanned} from './certificate-scanned.model';
import {OrganizationId} from './organization-id.model';
/**
 * The model type is generated from OpenAPI schema - account
 * Account details
 */
export type Account = {
  accountId: AccountId;
  organizationId?: OrganizationId;
} & AccountInitial & {
    scans?: CertificateScanned[];
    verified: boolean;
    active: boolean;
    picture: string;
  };
