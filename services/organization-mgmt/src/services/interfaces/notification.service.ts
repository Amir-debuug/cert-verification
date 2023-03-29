export interface NotificationService {
  sendInvitationEmail(
    emailAddress: string,
    organization: string,
  ): Promise<void>;
}
