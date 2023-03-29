export interface NotificationService {
  sendSignerEmail(
    emailAddress: string,
    certificateId: string,
    organization: string,
  ): Promise<void>;
  sendEmail(
    emailAddress: string,
    emailSubject: string,
    emailBody: string,
  ): Promise<void>;
}
