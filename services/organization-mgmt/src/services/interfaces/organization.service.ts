import {
  Account,
  AccountId,
  AccountInitial,
  Organization,
  OrganizationInitial,
} from '../../models';

export interface OrganizationService {
  newOrganization(organization: OrganizationInitial): Promise<string>;
  getOrganization(organizationId: string): Promise<Organization>;
  countOrganizations(filter?: string): Promise<number>;
  getOrganizations(
    filter?: string,
    sort?: string,
    limit?: number,
    offset?: number,
  ): Promise<
    (Organization & {
      amountOfCertificates?: number;
    })[]
  >;
  updateOrganization(
    organizationId: string,
    organization: Partial<Organization>,
    keepUnknown?: boolean,
  ): Promise<void>;
  deleteOrganization(organizationId: string): Promise<void>;

  /** Organization accounts */
  newOrganizationAccount(
    organizationId: string,
    account: AccountInitial,
  ): Promise<AccountId>;
  countOrganizationAccounts(
    organizationId: string,
    filter?: string,
  ): Promise<number>;
  getOrganizationAccounts(organizationId: string): Promise<Account[]>;
  updateOrganizationAccount(
    organizationId: string,
    accountId: string,
    account: Partial<Account>,
    keepUnknown?: boolean,
  ): Promise<void>;
  deleteOrganizationAccount(
    organizationId: string,
    accountId: string,
  ): Promise<void>;
}
