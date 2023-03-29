import {UserProfile} from '@loopback/security';
import {SessionInfo} from '../../models/session-info.model';

export interface SessionService {
  newSession(sessInfo: SessionInfo, expireAt: number): Promise<string>;
  checkSession(profile: UserProfile): Promise<SessionInfo>;
  /*checkSession(sessionId: string, deviceId: string): Promise<SessionInfo>;
  updateSession(sessionId: string, sessInfo: SessionInfo): Promise<void>;*/
}
