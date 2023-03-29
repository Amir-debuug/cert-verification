import {UserProfile} from '@loopback/security';
import {DocumentAccessPermissionEntity} from '../../entities';
import {
  Certificate,
  CertificateHistory,
  CertificateId,
  CertificateInitial,
  Comment,
  Document,
  DocumentId,
  DocumentInitial,
  Signer,
} from '../../models';

export interface CertificateService {
  getDocumentsFromAccount(accountId: any): Promise<(Document)[]>
  addAdminSigner(issuer: UserProfile, certificateId: string): Promise<string>;
  //
  newSigner(
    issuer: UserProfile,
    certificateId: string,
    signer: Signer,
    signed?: boolean,
  ): Promise<string>;
  //
  newDocument(
    issuer: UserProfile,
    ownerId: CertificateId,
    document: DocumentInitial,
  ): Promise<string>;
  //
  getDocument(
    requester: UserProfile,
    ownerId: CertificateId,
    documentId: DocumentId,
  ): Promise<string>;
  //
  getDocuments(
    ownerId: string,
    filter?: string,
    sort?: string,
    limit?: number,
    offset?: number,
  ): Promise<Document[]>;
  revokeDocument(
    issuer: UserProfile,
    ownerId: CertificateId,
    documentId: DocumentId,
  ): Promise<unknown>;
  //
  newComment(
    issuer: UserProfile,
    certificateId: CertificateId,
    comment: string,
  ): Promise<string>;
  //
  getComments(
    issuer: UserProfile,
    certificateId: CertificateId,
  ): Promise<Comment[]>;
  //
  getHistory(
    requester: UserProfile,
    certificateId: CertificateId,
  ): Promise<CertificateHistory>;

  addAccessPermission(
    documentId: string,
    accountId: string,
    accessLevel: 'owner' | 'partner' | 'viewer',
  ): Promise<string>;

  getAccessPermission(
    documentId: string,
  ): Promise<DocumentAccessPermissionEntity[]>;
}
