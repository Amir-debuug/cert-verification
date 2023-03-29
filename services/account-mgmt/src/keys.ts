import {TokenService} from '@loopback/authentication';
import {BindingKey} from '@loopback/context';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import {
  AccountService,
  NotificationService,
  SessionService,
} from './services/interfaces';

dotenv.config();

export namespace AppConstants {
  export const EMAIL_FROM = 'noreply@galab.de';
  export const ADMIN_EMAIL = 'customers@tracifier.com';
  export const SENTRY_DSN = process.env.SENTRY_DSN;
  export const SENTRY_RATE = 1.0;
  // export const EMAIL_FROM = 'notification.eu-frankfurt-1.oci.oraclecloud.com';
  export const EMAIL_SETTINGS = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.TLS_ON === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  export const AWS_S3_REGION = process.env.AWS_S3_REGION;
  export const AWS_S3_ACCESS_KEY_ID = process.env.AWS_S3_ACCESS_KEY_ID;
  export const AWS_S3_SECRET_ACCESS_KEY = process.env.AWS_S3_SECRET_ACCESS_KEY;
  export const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;
  export const ORACLEDB_SETTINGS = {
    name: 'mongodb',
    connector: 'mongodb',
    url: process.env.MONGODB_URL,
    useNewUrlParser: true,
  };

  export const VERIFY_SUBJECT = 'Tracifier Verification Code';

  export const WELCOME_SUBJECT = 'Welcome to Tracifier DMS solution! Please Verify Your Account';
  export const ADMIN_NEW_USER_SUBJECT = 'New User Is Registerd on Tracifier';
  export const VERIFY_BODY = (authCode: string, baseUrl: string) => {
    const content = fs.readFileSync(
      path.join(__dirname, '../public/templates/verify.email.html'),
      'utf8',
    );
    const email = content.replace('${authCode}', authCode).replace('${baseUrl}', baseUrl);
    return email;
  };

  export const WELCOME_BODY = (authCode: string, baseUrl: string) => {
    const content = fs.readFileSync(
      path.join(__dirname, '../public/templates/welcome.email.html'),
      'utf8',
    );
    const email = content.replace('${baseUrl}', baseUrl).replace('${authCode}', authCode);;
    return email;
  };

  export const NEW_USER_REGISTERED_BODY = (baseUrl: string, emailAddress: string) => {
    const content = fs.readFileSync(
      path.join(__dirname, '../public/templates/admin/new-user-registered.email.html'),
      'utf8',
    );
    const email = content.replace('${baseUrl}', baseUrl).replace('${emailAddress}', emailAddress);
    return email;
  };
}

export namespace AccountServiceBindings {
  export const ACCOUNT_SERVICE = BindingKey.create<AccountService>(
    'services.account.service',
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
