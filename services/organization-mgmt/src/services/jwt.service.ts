import {TokenService} from '@loopback/authentication';
import {inject} from '@loopback/context';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {promisify} from 'util';
import {TokenServiceBindings} from '../keys';
import {TokenPayload} from '../models/token-payload.model';

const jwt = require('jsonwebtoken');
const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify);

export class JWTService implements TokenService {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SECRET)
    private jwtSecret: string,
    @inject(TokenServiceBindings.TOKEN_EXPIRES_IN)
    private jwtExpiresIn: string,
  ) {}

  async verifyToken(token: string): Promise<UserProfile> {
    if (!token) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token: 'token' is null`,
      );
    }

    let userProfile: UserProfile;

    try {
      console.log('1st step ',token)

      // decode user profile from token
      const decryptedToken = await verifyAsync(token, this.jwtSecret);
      decryptedToken.role = 'internal'
      console.log('--------->>>>>>>>>>..',decryptedToken)
      // don't copy over  token field 'iat' and 'exp', nor 'email' to user profile
      userProfile = Object.assign(
        {
          [securityId]: '',
          accountId: '',
          sessionId: '',
          organizationId: undefined,
          deviceId: '',
          role: '',
        },
        {
          [securityId]: decryptedToken.sub,
          accountId: decryptedToken.sub,
          sessionId: decryptedToken.ses,
          organizationId: decryptedToken.org,
          deviceId: decryptedToken.dev,
          role: decryptedToken.role,
        },
      );
    } catch (error) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token: ${error.message}`,
      );
    }

    return userProfile;
  }

  async generateToken(userProfile: UserProfile): Promise<string> {
    if (!userProfile) {
      throw new HttpErrors.Unauthorized(
        'Error generating token: userProfile is null',
      );
    }

    // Generate a JSON Web Token
    let token: string;
    try {
      token = await signAsync(this.parse(userProfile), this.jwtSecret, {
        expiresIn: Number(this.jwtExpiresIn),
      });
    } catch (error) {
      throw new HttpErrors.Unauthorized(`Error encoding token: ${error}`);
    }

    return token;
  }

  private parse(userProfile: UserProfile): object {
    const jwtPayload = new TokenPayload({
      iss: 'Tracifier',
      sub: userProfile[securityId],
      ses: userProfile.sessionId,
      org: userProfile.organizationId,
      dev: userProfile.deviceId,
      role: userProfile.role,
    });

    return JSON.parse(JSON.stringify(jwtPayload));
  }
}
