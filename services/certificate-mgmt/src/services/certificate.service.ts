import {BindingScope, inject, injectable} from '@loopback/core';
import {WhereBuilder} from '@loopback/filter';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {ChannelManagementService} from '.';
import {
  AccountEntity,
  CertificateEntity,
  CommentEntity,
  DocumentAccessPermissionEntity,
  DocumentEntity,
  SignerEntity,
} from '../entities';
import {ChannelServiceBindings} from '../keys';
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
} from '../models';
import {
  AccountsRepository,
  CertificatesRepository,
  CommentsRepository,
  DocumentAccessPermissionsRepository,
  DocumentsRepository,
  SignersRepository,
} from '../repositories';
import {CertificateService} from './interfaces';
import {
  createOrderClause,
  createWhereClause,
  generateHash,
} from './parser.utils';
import {getObject} from './utils/OCI.SDK.utils';
import {PdfUtility} from './utils/pdf.utils';
import { getObjectFromS3, uploadFileToS3 } from './utils/S3.utils';

@injectable({scope: BindingScope.TRANSIENT})
export class CertificateServiceProvider implements CertificateService {
  constructor(
    @repository(AccountsRepository)
    public accountsRepository: AccountsRepository,
    @repository(CertificatesRepository)
    public certificatesRepository: CertificatesRepository,
    @repository(CommentsRepository)
    public commentsRepository: CommentsRepository,
    @repository(DocumentAccessPermissionsRepository)
    public documentAccessPermissionRepository: DocumentAccessPermissionsRepository,
    @repository(DocumentsRepository)
    public documentsRepository: DocumentsRepository,
    @repository(SignersRepository)
    public signersRepository: SignersRepository,
    @inject(ChannelServiceBindings.CHANNEL_SERVICE)
    public channelService: ChannelManagementService,
  ) {}


  async addAdminSigner(
    issuer: UserProfile,
    certificateId: string,
  ): Promise<string> {
    const adminEntity = await this.accountsRepository.findById(
      issuer.accountId,
    );

    // Create signer hash
    const signer = new Signer({
      accountId: adminEntity.accountId,
      name: adminEntity.name,
      emailAddress: adminEntity.emailAddress,
      signed: true,
    });

    return this.newSigner(issuer, certificateId, signer, true);
  }

  async newSigner(
    issuer: UserProfile,
    certificateId: string,
    signer: Signer,
    signed = false,
  ): Promise<string> {
    // Check if certificate exists
    await this._checkExistingCertificate(issuer, certificateId);

    // Create signer hash
    const signerHash = generateHash(certificateId, signer.emailAddress);

    // Check if signer already exists
    if (await this.signersRepository.exists(signerHash)) {
      throw new HttpErrors.BadRequest(
        'This signer is already added to this certificate.',
      );
    }

    // Check if signer belongs to existing account
    let accountEntity: AccountEntity;
    const accountHash = !signer.accountId
      ? generateHash(signer.emailAddress)
      : signer.accountId;

    try {
      accountEntity = await this.accountsRepository.findById(accountHash);
    } catch (error) {
      accountEntity = await this.accountsRepository.create({
        accountId: accountHash,
        name: signer.name,
        emailAddress: signer.emailAddress,
        userRole: 'signer',
        jobPosition: 'Signer',
        active: true,
        verified: true,
      });
    }

    // Add signer
    const entity = new SignerEntity({
      signerId: signerHash,
      certificateId: certificateId,
      accountId: accountEntity.accountId,
      name: accountEntity.name,
      emailAddress: accountEntity.emailAddress,
      signed: signed,
      signedOn: signed ? new Date().toISOString() : undefined,
    });

    await this.signersRepository.create(entity);

    return accountEntity.accountId;
  }

  async newDocument(
    issuer: UserProfile,
    ownerId: string,
    document: DocumentInitial,
  ): Promise<string> {
    // Init variables
    const pdfUtil = new PdfUtility();
    const createdAt = new Date().toISOString();

    // Check if certificate exists
    // await this._checkExistingCertificate(issuer, certificateId);

    // Create document hash
    const documentHash = generateHash(
      ownerId,
    );

    // Check if document does not already exits
    if (await this.documentsRepository.exists(documentHash)) {
      throw new HttpErrors.BadRequest(
        'There is already a document in our system for the given request.',
      );
    }

    // Check if file content is present
    if (!document.fileContent) {
      throw new HttpErrors.BadRequest(
        'The required file content of the document is missing in the request.',
      );
    }

    // Create QR code and add pdf footer
    const qrHash = pdfUtil.generateHash(
      documentHash + '||' + createdAt + '||1',
    );

    // Adding the QR to pdf footer
    const updatedDocumentContent = await pdfUtil.modifyDocument(
      document.fileContent,
      qrHash,
    );

    const uploadResult = await uploadFileToS3(document.fileContent,`documents/${ownerId}/${document.name}.pdf`);

    // // Get amount of signers
    // const signers = await this.signersRepository.count({
    //   certificateId: certificateId,
    // });

    // Add Document
    const entity = new DocumentEntity({
      documentId: documentHash,
      ownerId,
      name: document.name,
      status: document.singersCount === 1 ? 'signed' : 'sent',
      requestedAt: document.requestedAt
        ? document.requestedAt.toString()
        : new Date().toISOString(),
      validUntil: document.validUntil
        ? document.validUntil.toString()
        : undefined,
      attachmentHash: uploadResult['key'].toString(),
      attachmentLink: uploadResult['ETag'].toString(),
      folderName: document.folderName,
      createdAt: createdAt,
    });
    await this.documentsRepository.create(entity);

    // add permission for the new document
    await this.addAccessPermission(documentHash,ownerId,'owner');

    // update old documents status
    await this.documentsRepository.updateAll(
      {status: 'revoked'},
      {
        and: [
          {ownerId},
          {documentId: {neq: documentHash}},
        ],
      },
    );

    return documentHash;
  }

  async getDocument(
    requester: UserProfile,
    ownerId: CertificateId,
    documentId: DocumentId,
  ): Promise<string> {
    // get current document permissions
    const permissions = await this.getAccessPermission(documentId);

    if(!permissions.find(per=>per.accountId==ownerId)){
      throw new HttpErrors.Forbidden(
              'Your account does not own this certificate.',
            );
    }

    // Get document from database
    const document = await this.documentsRepository.findById(documentId);

    
    return await getObjectFromS3(
      'documents/' + ownerId + '/' + document.name + '.pdf',
    );
  }


  async getDocuments(
    ownerId: string,
    filter?: string,
    sort?: string,
    limit?: number,
    offset?: number,
  ): Promise<
    (Document)[]
  > {

    filter = `ownerId=${ownerId} and ${filter}`;
    
    // Find documents
    const documents = await this.documentsRepository.find({
      where: createWhereClause(filter),
      order: createOrderClause(sort),
      limit: limit,
      skip: offset,
    });

    return await this._transformEntitiesToDocumentList(documents);
  }

  async getDocumentsFromAccount(
    accountId: string,
  ): Promise<
    (Document)[]
  > {

    const filter = `ownerId=${accountId}`;
    
    // Find documents
    const documents = await this.documentsRepository.find({
      where: createWhereClause(filter)
    });
    let documentData = [];
    if(documents) {
      documentData = await this._transformEntitiesToDocumentList(documents);
    }
    return documentData;
  }


  async revokeDocument(
    requester: UserProfile,
    ownerId: string,
    documentId: string,
  ): Promise<unknown> {
    // Check if certificate exists
    await this._checkExistingCertificate(requester, ownerId);

    // Revoke document only when belongs to certificateId
    const updated = await this.documentsRepository.updateAll(
      {
        status: 'revoked',
      },
      {
        and: [{documentId: documentId}, {ownerId}],
      },
    );

    if (updated.count === 0) {
      throw new HttpErrors.NotFound('No document found to revoke.');
    }

    return;
  }

  async newComment(
    issuer: UserProfile,
    certificateId: string,
    comment: string,
  ): Promise<string> {
    // Check if certificate exists
    await this._checkExistingCertificate(issuer, certificateId);

    // Create comment hash
    const commentHash = generateHash(
      certificateId,
      comment,
      Date.now().toString(),
    );

    // Check if comment does not already exits
    // if (await this.commentsRepository.exists(commentHash)) {
    //   throw new HttpErrors.BadRequest(
    //     'There is already a comment for the given form data.',
    //   );
    // }

    // Add Comment
    const entity = new CommentEntity({
      certificateId: certificateId,
      comment: comment,
      commentId: commentHash,
      accountId: issuer.accountId,
      createdAt: new Date().toISOString(),
    });
    await this.commentsRepository.create(entity);

    return commentHash;
  }

  async getComments(
    requester: UserProfile,
    certificateId: string,
  ): Promise<Comment[]> {
    // Check if certificate exists
    await this._checkExistingCertificate(requester, certificateId);

    // Add Comment
    const entities = await this.commentsRepository.find({
      where: {
        certificateId: certificateId,
      },
      order: ['createdAt DESC'],
    });

    const comments: Comment[] = [];
    entities.forEach(comment => {
      comments.push({
        commentId: comment.commentId,
        comment: comment.comment,
      });
    });

    return comments;
  }

  async addAccessPermission(documentId: string, accountId: string, accessLevel: 'owner' | 'partner' | 'viewer'): Promise<string> {
    const permissionHash = generateHash(
      accountId,
      documentId,
      accessLevel,
    );

    // Check if permission does not already exits
    if (await this.documentAccessPermissionRepository.exists(permissionHash)) {
      throw new HttpErrors.BadRequest(
        'There is already a access permission for the given form data.',
      );
    }

    // Add Permission
    const entity = new DocumentAccessPermissionEntity({
      permissionId: permissionHash,
      documentId,
      accountId,
      accessLevel,
      createdAt: new Date().toISOString(),
    });
    await this.documentAccessPermissionRepository.create(entity);

    return permissionHash;
  }

  async getAccessPermission(documentId: string): Promise<DocumentAccessPermissionEntity[]> {
      return await this.documentAccessPermissionRepository.find({
        where: {
          documentId,
        },
      });
  }

  // async signCertificate(
  //   signer: UserProfile,
  //   certificateId: CertificateId,
  // ): Promise<boolean> {
  //   // Check if certificate exists
  //   await this._checkExistingCertificate(signer, certificateId);

  //   // Check if certificate has any documents to sign
  //   const document = await this.documentsRepository.findOne({
  //     where: {and: [{ownerId}, {status: 'sent'}]},
  //   });
  //   if (!document) {
  //     throw new HttpErrors.BadRequest(
  //       'This certificate is either already signed or revoked.',
  //     );
  //   }

  //   // Check if signer is allowed to sign
  //   const signee = await this.signersRepository.findOne({
  //     where: {
  //       and: [{certificateId: certificateId}, {accountId: signer.accountId}],
  //     },
  //   });

  //   // Sign certificate
  //   if (!signee.signed) {
  //     signee.signed = true;
  //     signee.signedOn = new Date().toISOString();
  //   } else {
  //     throw new HttpErrors.BadRequest(
  //       'You already signed this certificate before.',
  //     );
  //   }
  //   await this.signersRepository.update(signee);

  //   // Check if everybody signed
  //   const signers = await this.signersRepository.find({
  //     where: {certificateId: certificateId},
  //   });

  //   let allSigned = true;
  //   signers.forEach(entity => {
  //     if (!entity.signed) {
  //       allSigned = false;
  //     }
  //   });

  //   if (allSigned) {
  //     await this.documentsRepository.updateAll(
  //       {status: 'signed'},
  //       {
  //         and: [{certificateId: certificateId}, {status: 'sent'}],
  //       },
  //     );
  //   }

  //   return true;
  // }

  async getHistory(
    requester: UserProfile,
    certificateId: CertificateId,
  ): Promise<CertificateHistory> {
    // Check if certificate exists
    const cert = await this._checkExistingCertificate(requester, certificateId);

    // Get signers
    const signers = await this.signersRepository.find({
      where: {certificateId: certificateId},
    });

    const signed = [];
    signers.forEach(signer => {
      if (signer.signed) {
        signed.push({
          name: signer.name,
          emailAddress: signer.emailAddress,
          signedOn: signer.signedOn,
        });
      }
    });

    return new CertificateHistory({
      signers: signed,
      transactions: [
        {
          transactionId: generateHash(certificateId, Date.now().toString()),
          title: 'Certificate Created',
          description:
            `Certificate created with id ${cert.certificateId} ` +
            `at ${cert.createdAt}`,
        },
      ],
    });
  }

  private async _checkExistingCertificate(
    requester: UserProfile,
    certificateId: string,
  ): Promise<CertificateEntity> {
    // Check if certificate exists
    const certificate = await this.certificatesRepository.findById(
      certificateId,
    );

    // Check if the User is owner of certificate
    if (
      requester.role !== 'internal' &&
      requester.accountId !== certificate.ownerId
    ) {
      throw new HttpErrors.BadRequest(
        'You don’t have permission to access this resource.',
      );
    }

    return certificate;
  }
  private async _transformEntitiesToDocumentList(
    entities: DocumentEntity[],
  ): Promise<Document[]> {
    if (entities && entities.length > 0) {
      const documents: Document[] = [];
      for (const document of entities) {
        let image: Buffer;
        if (document.status !== 'revoked') {
          image = await getObject(
            'documents/' +
              document.ownerId +
              '/' +
              document.name +
              '.jpg',
          );
        }
        documents.push(
          this._transformEntityToDocument(document, image?.toString('base64')),
        );
      }
      return documents;
    } else {
      return;
    }
  }

  private _transformEntityToDocument(
    entity: DocumentEntity,
    fileContent?: string,
  ): Document {
    if (entity) {
      return {
        documentId: entity.documentId,
        name: entity.name,
        ownerId:entity.ownerId,
        fileContent: fileContent,
        status: entity.status,
        folderName: entity.folderName,
        requestedAt: entity.requestedAt
          ? new Date(entity.requestedAt)
          : undefined,
        validUntil: entity.validUntil ? new Date(entity.validUntil) : undefined,
      };
    } else {
      return;
    }
  }

  private _transformEntitiesToSignerList(entities: SignerEntity[]): Signer[] {
    if (entities && entities.length > 0) {
      const signers: Signer[] = [];
      entities.forEach(signer => {
        signers.push({
          accountId: signer.accountId,
          name: signer.name,
          emailAddress: signer.emailAddress,
          signed: signer.signed,
        });
      });
      return signers;
    } else {
      return;
    }
  }
}
