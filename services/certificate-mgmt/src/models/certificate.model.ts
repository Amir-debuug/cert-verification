import {CertificateId} from './certificate-id.model';
import {CertificateInitial} from './certificate-initial.model';
/**
 * The model type is generated from OpenAPI schema - certificate
 * Certificate details
 */
export type Certificate = {
  certificateId: CertificateId;
} & CertificateInitial & {
    txHash?: string;
  };
