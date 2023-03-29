import {TokenService} from '@loopback/authentication';
import {BindingKey} from '@loopback/context';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import {
  NotificationService,
  OrganizationService as OrganizationService,
  SessionService,
} from './services/interfaces';

dotenv.config();

export namespace AppConstants {
  export const INT_ORGS = ['tracifier.com', 'galab.de', 'yopmail.com'];
  export const SENTRY_DSN = process.env.SENTRY_DSN;
  export const SENTRY_RATE = 1.0;
  export const EMAIL_FROM = process.env.EMAIL_NOREPLY;
  export const AWS_S3_REGION = process.env.AWS_S3_REGION;
  export const AWS_S3_ACCESS_KEY_ID = process.env.AWS_S3_ACCESS_KEY_ID;
  export const AWS_S3_SECRET_ACCESS_KEY = process.env.AWS_S3_SECRET_ACCESS_KEY;
  export const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;
  export const EMAIL_SETTINGS = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.TLS_ON === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };
  export const ORACLEDB_SETTINGS = {
    name: 'mongodb',
    connector: 'mongodb',
    url: process.env.MONGODB_URL,
    useNewUrlParser: true,
  };

  export const INVITE_SUBJECT = 'Welcome to Trust your Certificate';
  export const INVITE_BODY = (organization, authURL) => {
    const content = fs.readFileSync(
      path.join(__dirname, '../public/templates/invitation.email.html'),
      'utf8',
    );
    let email = content.replace('${organization}', organization);
    email = replaceAll(email, '${authURL}', authURL);

    return email;
  };

  const replaceAll = (string, search, replace) => {
    return string.split(search).join(replace);
  };
}

export namespace OrganizationServiceBindings {
  export const ORGANIZATION_SERVICE = BindingKey.create<OrganizationService>(
    'services.organization.service',
  );
}

export namespace NotificationServiceBindings {
  export const NOTIFICATION_SERVICE = BindingKey.create<NotificationService>(
    'services.notification.service',
  );
}

export namespace SessionServiceBindings {
  export const SESSION_SERVICE = BindingKey.create<SessionService>(
    'services.session.service',
  );
}
export namespace TokenServiceConstants {
  export const TOKEN_SECRET_VALUE = process.env.TOKEN_SECRET;
  export const TOKEN_EXPIRES_IN_VALUE = process.env.TOKEN_EXPIRE;
}

export namespace TokenServiceBindings {
  export const TOKEN_SECRET = BindingKey.create<string>(
    'authentication.jwt.secret',
  );
  export const TOKEN_EXPIRES_IN = BindingKey.create<string>(
    'authentication.jwt.expires.in.seconds',
  );
  export const TOKEN_SERVICE = BindingKey.create<TokenService>(
    'services.authentication.jwt.tokenservice',
  );
}
