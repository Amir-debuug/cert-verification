import {OrganizationId} from './organization-id.model';
import {OrganizationInitial} from './organization-initial.model';
/**
 * The model type is generated from OpenAPI schema - organization
 * Organization details
 */
export type Organization = {
  organizationId: OrganizationId;
} & OrganizationInitial & {
    verified: boolean;
    active: boolean;
    picture: string;
  };
