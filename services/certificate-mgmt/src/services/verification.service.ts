import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {CertificateEntity} from '../entities';
import {Certificate} from '../models';
import {CertificatesRepository, DocumentsRepository} from '../repositories';
import {VerificationService} from './interfaces';
import {getObject} from './utils/OCI.SDK.utils';
import {PdfUtility} from './utils/pdf.utils';

export class VerificationServiceProvider implements VerificationService {
  constructor(
    @repository(DocumentsRepository)
    public documentsRepository: DocumentsRepository,
    @repository(CertificatesRepository)
    public certificatesRepository: CertificatesRepository,
  ) {}

  async verifyDocument(
    inputModel:
      | {
          ownerId: string;
          documentId: string;
          createdAt: string;
          amountOfSigners: number;
        }
      | {fileContent: string},
  ): Promise<{isValid: boolean; certificate?: Certificate}> {
    const pdfUtil = new PdfUtility();

    if (inputModel['fileContent'] !== undefined) {
      const qrHash = await pdfUtil.getVerificationHashFromContent(
        inputModel['fileContent'],
      );

      //Get certificate from hash
      /* const certificateId = pdfUtil.decodeHash(qrHash).split('||')[0];
      const certificate = await this.certificatesRepository.findById(
        certificateId,
      ); */
      return {
        isValid: true,
        //certificate: this._transformEntityToCertificate(certificate),
      };
    } else {
      const ownerId: string = inputModel['ownerId'];
      const documentId: string = inputModel['documentId'];
      const createdAt = inputModel['createdAt'];
      const amountOfSigners = inputModel['amountOfSigners'] ?? '1';

      // Get Certificate from database
      /* const certificate = await this.certificatesRepository.findById(
        certificateId,
      ); */
      // Get document from database
      const document = await this.documentsRepository.findById(documentId);

      //Get file from Oci
      const fileContent: Buffer = await getObject(
        'certificates/' + ownerId + '/' + document.name + '.pdf',
      );

      const qrHash = await pdfUtil.getVerificationHash(fileContent);
      const decodedHash = pdfUtil.decodeHash(qrHash).split('||');

      if (
        decodedHash[0] === ownerId &&
        decodedHash[1] === documentId &&
        decodedHash[2] === createdAt &&
        decodedHash[3] === amountOfSigners
      ) {
        return {
          isValid: true,
          //certificate: this._transformEntityToCertificate(certificate),
        };
      }
    }
    return {
      isValid: false,
    };
  }

  _transformEntityToCertificate(certificate: CertificateEntity): Certificate {
    return {
      certificateId: certificate.certificateId,
      sampleId: certificate.sampleId,
      lotNumber: certificate.lotNumber,
      product: certificate.product,
      category: certificate.category,
      requestedBy: {
        accountId: certificate.requesterId,
        name: certificate.requesterName,
      },
    };
  }
}
