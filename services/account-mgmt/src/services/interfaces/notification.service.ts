import {Signature} from '../../models';

export interface NotificationService {
  sendCodeByEmail(
    emailAddress: string,
    signature: Signature,
    firstTime?: boolean,
  ): Promise<string>;
}
