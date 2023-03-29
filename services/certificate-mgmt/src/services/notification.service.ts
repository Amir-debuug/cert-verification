import {BindingScope, injectable} from '@loopback/core';
import * as nodemailer from 'nodemailer';
import {AppConstants} from '../keys';
import {NotificationService} from './interfaces';

@injectable({scope: BindingScope.TRANSIENT})
export class NotificationServiceProvider implements NotificationService {
  constructor() {}

  async sendSignerEmail(
    emailAddress: string,
    certificateId: string,
    organization: string,
  ): Promise<void> {
    const emailSubject = AppConstants.INVITE_SUBJECT;
    const emailBody = AppConstants.INVITE_BODY(
      organization,
      `http://45.79.147.166:5000/login?certificateId=${certificateId}`,
    );

    await this.sendEmail(emailAddress, emailSubject, emailBody);
  }

  async sendEmail(
    emailAddress: string,
    emailSubject: string,
    emailBody: string,
  ): Promise<void> {
    const transporter = nodemailer.createTransport(AppConstants.EMAIL_SETTINGS);

    const info = await transporter.sendMail({
      from: AppConstants.EMAIL_FROM,
      to: emailAddress,
      subject: emailSubject,
      html: emailBody,
    });

    console.info('Message sent: %s', info.messageId);
  }
}
