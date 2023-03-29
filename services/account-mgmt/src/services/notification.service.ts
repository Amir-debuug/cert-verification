import {BindingScope, inject, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import * as nodemailer from 'nodemailer';
import {CodeEntity} from '../entities';
import {AppConstants} from '../keys';
import {Signature} from '../models';
import {CodesRepository} from '../repositories';
import {NotificationService} from './interfaces';
import {generateAuthCode, generateHash} from './parser.utils';
import {Request, RestBindings} from '@loopback/rest';
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: AppConstants.SENTRY_DSN,
  tracesSampleRate: AppConstants.SENTRY_RATE,
});

Sentry.setTags({
  'service-name': 'account-management-service',
});

@injectable({scope: BindingScope.TRANSIENT})
export class NotificationServiceProvider implements NotificationService {
  constructor(
    @repository(CodesRepository)
    public codesRepository: CodesRepository,
    @inject(RestBindings.Http.REQUEST) private request: Request,
  ) {}

  async sendCodeByEmail(
    emailAddress: string,
    signature: Signature,
    firstTime = false,
  ): Promise<string> {
    // Generate code hash
    const codeHash = generateHash(signature.userAgent, signature.uniqueId);
    const accountHash = generateHash(emailAddress);

    // Generate verification code
    const authCode = generateAuthCode(6);

    // Check if a code exists for device
    try {
      const code: CodeEntity = await this.codesRepository.findById(codeHash);
      code.authCode = authCode;
      await this.codesRepository.update(code);
    } catch (err) {
      if (err.code === 'ENTITY_NOT_FOUND') {
        // If not found, store code in repository
        const newCode = {
          codeId: codeHash,
          deviceId: signature.uniqueId,
          accountId: accountHash,
          userAgent: signature.userAgent,
          authCode: authCode,
          firstTime: firstTime,
        };
        await this.codesRepository.create(newCode);
      } else {
        throw err;
      }
    }

    const baseUrl = `${this.request.protocol}://${this.request.get('host')}`;
    // Welcome Email
    await this.sendEmail(
      emailAddress,
      AppConstants.WELCOME_SUBJECT,
      AppConstants.WELCOME_BODY(authCode, baseUrl),
    );

    // Send Email To Tracifier Admin
    await this.sendEmail(
      AppConstants.ADMIN_EMAIL,
      AppConstants.ADMIN_NEW_USER_SUBJECT,
      AppConstants.NEW_USER_REGISTERED_BODY(baseUrl, emailAddress),
    );

    return codeHash;
  }

  async sendEmail(
    emailAddress: string,
    emailSubject: string,
    emailBody: string,
  ): Promise<void> {
    console.log(['=========', AppConstants.EMAIL_SETTINGS]);
    const transporter = nodemailer.createTransport(AppConstants.EMAIL_SETTINGS);

    const info = await transporter.sendMail({
      from: AppConstants.EMAIL_FROM,
      to: emailAddress,
      subject: emailSubject,
      html: emailBody,
    });
    console.log(['========= info', info]);

    console.info('Message sent: %s', info.messageId);
  }
}
