import {UserProfile} from '@loopback/security';
import {Signature, Statistics} from '../../models';

export interface DataManagementService {
  retrieveStatistics(accountId?: string, documents?: []): Promise<Statistics>;
  newScannedCert(
    requester: UserProfile,
    signature: Signature,
  ): Promise<string>;
}
