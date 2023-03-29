import {UserProfile} from '@loopback/security';
import {SessionInfo} from '../../models/session-info.model';

export interface SessionService {
  newSession(sessInfo: SessionInfo, expireAt: number): Promise<string>;
  checkSession(profile: UserProfile): Promise<SessionInfo>;
  checkInternalPermissions(profile: UserProfile): Promise<void>;
  checkOrganizationPermissions(
    profile: UserProfile,
    organizationId: string,
  ): Promise<void>;
}
