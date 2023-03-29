import {BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {SessionEntity} from '../entities';
import {AppConstants} from '../keys';
import {SessionInfo} from '../models';
import {AccountsRepository, SessionsRepository} from '../repositories';
import {SessionService} from './interfaces';
import {generateHash, generateHashes} from './parser.utils';

const minutesToAdd = 5;
@injectable({scope: BindingScope.TRANSIENT})
export class SessionServiceProvider implements SessionService {
  constructor(
    @repository(AccountsRepository)
    public accountsRepository: AccountsRepository,
    @repository(SessionsRepository)
    public sessionsRepository: SessionsRepository,
  ) {}

  async newSession(sessInfo: SessionInfo, expireAt: number): Promise<string> {
    // Remove old session
    const oldSession = await this.sessionsRepository.findOne({
      where: {
        and: [{deviceId: sessInfo.deviceId}, {accountId: sessInfo.accountId}],
      },
      fields: ['sessionId'],
    });

    if (oldSession) {
      await this.sessionsRepository.deleteById(oldSession.sessionId);
    }

    // Generate session hash
    const sessionHash = generateHash(
      sessInfo.deviceId,
      sessInfo.accountId,
      expireAt.toString(),
    );

    // Create new session
    const session = {
      sessionId: sessionHash,
      accountId: sessInfo.accountId,
      deviceId: sessInfo.deviceId,
      signatureHash: sessInfo.signatureHash,
      organizationId: sessInfo.organizationId,
      expireAt: new Date(expireAt),
    };
    await this.sessionsRepository.create(session);

    return sessionHash;
  }

  async checkSession(profile: UserProfile): Promise<SessionInfo> {
    // Check if session exists
    let session: SessionEntity;
    try {
      session = await this.sessionsRepository.findById(profile.sessionId);
    } catch (error) {
      throw new HttpErrors.Unauthorized(
        'Session has expired. Please re-login with your account.',
      );
    }

    // Check if session has expired
    if (session.expireAt <= new Date(Date.now() + minutesToAdd * 60000)) {
      await this.sessionsRepository.deleteById(profile.sessionId);
      throw new HttpErrors.Unauthorized(
        'Session has expired. Please re-login with your account.',
      );
    }

    // Check if the device id in session is same as current user profile
    if (session.deviceId !== profile.deviceId) {
      throw new HttpErrors.Unauthorized(
        'Invalid session. It does not belong to your device. Please re-login with your account.',
      );
    }

    // Check if the account id in session is same as current user profile
    if (session.accountId !== profile.accountId) {
      throw new HttpErrors.Forbidden(
        'Invalid session. It does not belong to given account. Please login with your account.',
      );
    }

    // Check if the organization id in session is same as current user profile
    if (
      session.organizationId &&
      session.organizationId !== profile.organizationId
    ) {
      throw new HttpErrors.Forbidden(
        'Invalid session. Account does not belong to given organization.',
      );
    }

    // Check if account in sessions still exists
    if (!(await this.accountsRepository.exists(session.accountId))) {
      throw new HttpErrors.Unauthorized(
        'Session account does not exists in our system. Please register first',
      );
    }

    return new SessionInfo({
      deviceId: session.deviceId,
      accountId: session.accountId,
      organizationId: session.organizationId,
      signatureHash: session.signatureHash,
    });
  }

  async checkInternalPermissions(profile: UserProfile): Promise<void> {
    return;
    // Check if user has role internal
    if (profile.role !== 'admin') {
      throw new HttpErrors.Forbidden(
        'You don’t have permission to access this resource',
      );
    }
    
  }

  async checkOrganizationPermissions(
    profile: UserProfile,
    organizationId: string,
  ): Promise<void> {
    // Check if user updating own resource
    if (profile.organizationId !== organizationId) {
      // Check if user has role internal
      if (profile.role !== 'internal') {
        throw new HttpErrors.Forbidden(
          'You don’t have permission to update this resource',
        );
      }

      if (
        !generateHashes(AppConstants.INT_ORGS).includes(profile.organizationId)
      ) {
        throw new HttpErrors.Forbidden(
          'You don’t belong to an autorized organization to update this resource',
        );
      }
    } else {
      if (profile.role !== 'admin' && profile.role !== 'internal') {
        throw new HttpErrors.Forbidden(
          'You don’t have permission to update this resource',
        );
      }
    }
  }
}
