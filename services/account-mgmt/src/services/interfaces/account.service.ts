import {UserProfile} from '@loopback/security';
import {
  Account,
  AccountIds,
  AccountInitial,
  OrganizationInfo,
  Signature,
} from '../../models';

export interface AccountService {
  newAccount(
    account: AccountInitial & {
      organization?: OrganizationInfo;
    },
    signature: Signature,
  ): Promise<AccountIds>;

  authenticateAccount(emailAddress: string): Promise<boolean>;

  verifyAuthentication(
    signature: Signature,
    authCode: string,
  ): Promise<UserProfile>;

  getAccount(accountId: string): Promise<Account>;

  updateAccountProfile(
    accountId: string,
    account: Partial<Account>,
    keepUnknown?: boolean,
  ): Promise<void>;

  deleteAccountProfile(accountId: string): Promise<void>;
}
