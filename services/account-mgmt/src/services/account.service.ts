import {BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {AccountEntity, CodeEntity, ScanEntity} from '../entities';
import {
  Account,
  AccountIds,
  AccountInitial,
  OrganizationInfo,
  Signature,
} from '../models';
import {CertificateScanned} from '../models/certificate-scanned.model';
import {
  AccountsRepository,
  CodesRepository,
  OrganizationsRepository,
  ScansRepository,
} from '../repositories';
import {AccountService} from './interfaces';
import {generateHash} from './parser.utils';
import { uploadFileToS3, deleteObjectFromS3 } from './utils/S3.utils';

const ADMINIPS = ['89.20.162.146'];
@injectable({scope: BindingScope.TRANSIENT})
export class AccountServiceProvider implements AccountService {
  constructor(
    @repository(AccountsRepository)
    public accountsRepository: AccountsRepository,
    @repository(ScansRepository)
    public scansRepository: ScansRepository,
    @repository(OrganizationsRepository)
    public organizationsRepository: OrganizationsRepository,
    @repository(CodesRepository)
    public codesRepository: CodesRepository,
  ) {}

  async updateAccountProfile(
    accountId: string,
    account: Account,
    keepUnknown = true,
  ): Promise<void> {
    const entity: Account =
      this._transformEntityToAccount(account);

    if (!keepUnknown) {
      Object.keys(entity).forEach(
        key => entity[key] === undefined && delete entity[key],
      );
    }
    const timestamp = new Date().getTime(); // Get current timestamp
    const randomNumber = Math.floor(Math.random() * 10000); // Generate a random number between 0 and 9999
    const fileName = `image_${timestamp}_${randomNumber}.png`; // Create a file name using the timestamp and random number
    if(account.picture) {
      // check the image already exist then delete the previous image to update
     const account = await this.accountsRepository.getAccountById(accountId);
      if(account.picture) {
        await deleteObjectFromS3(account.picture);
      }
    }
    const uploadResult = await uploadFileToS3(account.picture,`profile/${accountId}/${fileName}`);
    entity.picture = uploadResult['Location'].toString();
    await this.accountsRepository.updateById(accountId, entity);
  }

  async deleteAccountProfile(
    accountId: string,
  ): Promise<void> {
    // Currently we are not deleting account, but unassociating it with organization
    const account = await this.accountsRepository.findById(accountId);

    if (!account) {
      throw new HttpErrors.NotFound('Account not found or picture not deleted');
    }
  
    account.picture = undefined;
    
    if(account.picture) {
      await deleteObjectFromS3(account.picture);
    }
  
    await this.accountsRepository.update(account);
  }

  async newAccount(
    account: AccountInitial & {
      organization?: OrganizationInfo;
    },
    signature: Signature,
  ): Promise<AccountIds> {
    // Generate account hash
    const accountHash = generateHash(account.emailAddress.toLocaleLowerCase());
    let verified = false;

    // Check if account does not already exits
    if (await this.accountsRepository.exists(accountHash)) {
      throw new HttpErrors.BadRequest(
        'An account for this email already exists. Please try to login.',
      );
    }

    // Check if userRole is valid
      verified = true;
   

    // Create user in database
    const user = {
      accountId: accountHash,
      firstName: account.firstName,
      lastName: account.lastName,
      industry: account.industry,
      companySize: account.companySize,
      emailAddress: account.emailAddress,
      phoneNumber: account.phoneNumber,
      userRole: account.userRole,
      jobPosition: account.jobPosition,
      active: false,
      verified: verified,
    };
    await this.accountsRepository.create(user);

    // Return AccountIds model object
    return new AccountIds({
      accountId: user.accountId,
    });
  }

  async authenticateAccount(emailAddress: string): Promise<boolean> {
    // Generate account hash
    const accountHash = generateHash(emailAddress.toLocaleLowerCase());

    // Check if account does exits
    if (!(await this.accountsRepository.exists(accountHash))) {
      throw new HttpErrors.BadRequest(
        'An account for this email identifier does not exists. ' +
          'Create an account first.',
      );
    }

    // Retrieve account
    const account: AccountEntity = await this.accountsRepository.findById(
      accountHash,
    );

    /* if (account.active === false) {
      throw new HttpErrors.Unauthorized(
        'This account exist but is not activated. ' +
          'Contact support for re-activation.',
      );
    } */

    return true;
  }

  async verifyAuthentication(
    signature: Signature,
    authCode: string,
  ): Promise<UserProfile> {
    // Generate authorization code hash
    const codeHash = generateHash(signature.userAgent, signature.uniqueId);

    // Check if code exists by retrieving it from the repository
    let code: CodeEntity;
    try {
      code = await this.codesRepository.findById(codeHash);
    } catch (error) {
      throw new HttpErrors.BadRequest(
        'No code found for the provided client signature. Please login again.',
      );
    }

    // Check if the current authentication code is correct
   /*  if (code.authCode !== authCode) {
      throw new HttpErrors.Unauthorized(
        'The provided code is invalid for this account. Please try again.',
      );
    } */

    // Remove the code if valid entered
    await this.codesRepository.deleteById(codeHash);

    // Retrieve associated account
     
    const account: AccountEntity = await this.accountsRepository.findById(
      code.accountId,
    );

    // Activate account when first time authentication
    if (code.firstTime) {
      await this.accountsRepository.updateById(account.accountId, {
        active: true,
      });

      // Activate organization if role is admin or internal
      if (account.userRole === 'admin' || account.userRole === 'internal') {
        await this.organizationsRepository.updateById(account.organizationId, {
          active: true,
        });
      }
    }

    // Return userprofile object
    const userProfile: UserProfile = {
      [securityId]: account.accountId,
      name: account.emailAddress,
      role: account.userRole,
      accountId: account.accountId,
      deviceId: signature.uniqueId,
      organizationId: account.organizationId,
    };
    return userProfile;
  }

  async getAccount(accountId: string): Promise<Account> {
    // Find account by ID
    const account: AccountEntity = await this.accountsRepository.findById(
      accountId,
    );

    // Get scans belonging to account
    const scans: ScanEntity[] = await this.scansRepository.find({
      where: {accountId: account.accountId},
    });

    const scanned: CertificateScanned[] = [];
    scans.forEach(element => {
      scanned.push({
        certificateId: element.certificateId,
        sampleId: element.sampleId,
        lotNumber: element.lotNumber,
        scannedAt: element.scannedAt,
      });
    });

    // Transform account entity to model
    return this._transformEntityToAccount(account, scanned);
  }

 

  _transformEntityToAccount(
    entity: Partial<AccountEntity>,
    scanned?: Partial<CertificateScanned[]>,
  ): Account {
    return {
      accountId: entity.accountId,
      organizationId: entity.organizationId,
      firstName: entity.firstName,
      lastName: entity.lastName,
      industry: entity.industry,
      companySize: entity.companySize,
      emailAddress: entity.emailAddress,
      jobPosition: entity.jobPosition,
      userRole: entity.userRole,
      active: entity.active,
      verified: entity.verified,
      scans: scanned,
      picture: entity.picture,
    };
  }
}
