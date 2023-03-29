import {Certificate, DocumentId} from '../../models';

export interface VerificationService {
  verifyDocument(
    inputModel:
      | {
          ownerId: string;
          documentId: DocumentId;
          createdAt: string;
          amountOfSigners: number;
        }
      | {
          fileContent: string;
        },
  ): Promise<{
    isValid: boolean;
    certificate?: Certificate;
  }>;
}
