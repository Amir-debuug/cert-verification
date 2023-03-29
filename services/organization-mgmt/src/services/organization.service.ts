import {BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {AccountEntity, OrganizationEntity} from '../entities';
import {
  Account,
  AccountInitial,
  Organization,
  OrganizationInitial,
} from '../models';
import {
  AccountsRepository,
  CertificatesRepository,
  OrganizationsRepository,
} from '../repositories';
import {OrganizationService} from './interfaces';
import {
  createOrderClause,
  createWhereClause,
  generateHash,
} from './parser.utils';
import { uploadFileToS3 } from './utils/S3.utils';

@injectable({scope: BindingScope.TRANSIENT})
export class OrganizationServiceProvider implements OrganizationService {
  constructor(
    @repository(OrganizationsRepository)
    public organizationsRepository: OrganizationsRepository,
    @repository(CertificatesRepository)
    public certificatesRepository: CertificatesRepository,
    @repository(AccountsRepository)
    public accountsRepository: AccountsRepository,
  ) {}

  async newOrganization(organization: OrganizationInitial): Promise<string> {
    // Create organization hash
    const organizationHash = generateHash(
      organization.contactInfo.emailAddress.split('@')[1].toLocaleLowerCase(),
    );
    console.log(organization)
    // Check if account does not already exits
    if (await this.organizationsRepository.exists(organizationHash)) {
      throw new HttpErrors.BadRequest(
        'An organization for the given contact email address already exists.',
      );
    }
    
    const organizationEntity = {
      organizationId: organizationHash,
      name: organization.name,
      picture: organization.picture,
      address: organization.address,
      contactInfo: organization.contactInfo,
      customerId: organization.customerId,
      industryCategory: organization.industryCategory,
      verified: true,
      active: true,
    };

    await this.organizationsRepository.create(organizationEntity);

    return organizationHash;
  }

  async getOrganization(organizationId: string): Promise<Organization> {
    // Find organization by ID
    const organization: OrganizationEntity =
      await this.organizationsRepository.findById(organizationId);

    // Get amount of certificates
    const certificates = await this.certificatesRepository.count({
      ownerId: organizationId,
    });

    // Transform account entity to model
    return this._transformEntityToOrganization(
      organization,
      certificates.count,
    );
  }

  async countOrganizations(filter?: string): Promise<number> {
    const numberOfOrganizations = await this.organizationsRepository.count(
      createWhereClause(filter),
    );
    return numberOfOrganizations.count;
  }

  async getOrganizations(
    filter?: string,
    sort?: string,
    limit?: number,
    offset?: number,
  ): Promise<
    (Organization & {
      amountOfCertificates?: number;
    })[]
  > {
    // Find organizations
    const entities = await this.organizationsRepository.find({
      where: createWhereClause(filter),
      order: createOrderClause(sort),
      limit: limit,
      skip: offset,
    });

    // Transform result
    const organizations: (Organization & {
      amountOfCertificates?: number;
    })[] = [];

    for (const entity of entities) {
      // Get amount of certificates
      const certificates = await this.certificatesRepository.count({
        ownerId: entity.organizationId,
      });

      organizations.push(
        this._transformEntityToOrganization(entity, certificates.count),
      );
    }

    return organizations;
  }

  async updateOrganization(
    organizationId: string,
    organization: Organization,
    keepUnknown = true,
  ): Promise<void> {
    const entity: OrganizationEntity =
      this._transformOrganizationToEntity(organization);

    if (!keepUnknown) {
      Object.keys(entity).forEach(
        key => entity[key] === undefined && delete entity[key],
      );
    }
    const timestamp = new Date().getTime(); // Get current timestamp
    const randomNumber = Math.floor(Math.random() * 10000); // Generate a random number between 0 and 9999
    const fileName = `image_${timestamp}_${randomNumber}.png`; // Create a file name using the timestamp and random number

    const uploadResult = await uploadFileToS3(organization.picture,`profile/${organizationId}/${fileName}`);
    entity.picture = uploadResult['Location'].toString();
    await this.organizationsRepository.updateById(organizationId, entity);
  }

  async deleteOrganization(organizationId: string): Promise<void> {
    await this.organizationsRepository.deleteById(organizationId);
  }

  async newOrganizationAccount(
    organizationId: string,
    account: AccountInitial,
  ): Promise<string> {
    // Generate account hash
    const accountHash = generateHash(account.emailAddress.toLocaleLowerCase());

    // Check if account does not already exits`
    const exist = await this.accountsRepository.find({
      where: {accountId: accountHash},
      fields: ['accountId', 'organizationId'],
    });
    if (exist.length === 1) {
      if (!exist[0].organizationId) {
        await this.accountsRepository.updateById(accountHash, {
          organizationId: organizationId,
        });
      } else {
        throw new HttpErrors.BadRequest(
          `Account '${account.emailAddress}' already assigned to another organization`,
        );
      }
    } else {
      const newAccount = {
        accountId: accountHash,
        organizationId: organizationId,
        firstName: account.firstName,
        lastName: account.lastName,
        emailAddress: account.emailAddress,
        phoneNumber: account.phoneNumber,
        jobPosition: account.jobPosition,
        userRole: account.userRole,
        active: true,
        verified: true,
      };
      await this.accountsRepository.create(newAccount);
    }

    return accountHash;
  }

  async countOrganizationAccounts(
    organizationId: string,
    filter?: string,
  ): Promise<number> {
    filter = filter ? filter.concat(',') : '';
    filter = filter.concat(`organizationId:eq:${organizationId}`);
    const numberOfAccounts = await this.accountsRepository.count(
      createWhereClause(filter),
    );
    return numberOfAccounts.count;
  }

  async getOrganizationAccounts(organizationId: string): Promise<Account[]> {
    // Check if organization exists
    if (!(await this.organizationsRepository.exists(organizationId))) {
      throw new HttpErrors.BadRequest(
        'An organization for the given id does not exist in the system.',
      );
    }

    // Find accounts by organization Id
    const entities = await this.accountsRepository.find({
      where: {organizationId: organizationId},
    });

    // Transform result
    const accounts: Account[] = [];
    entities.forEach(entity => {
      accounts.push(this._transformEntityToAccount(entity));
    });

    return accounts;
  }

  async deleteOrganizationAccount(
    organizationId: string,
    accountId: string,
  ): Promise<void> {
    // Currently we are not deleting account, but unassociating it with organization
    const deleted = await this.accountsRepository.updateAll(
      {organizationId: undefined},
      {and: [{accountId: accountId, organizationId: organizationId}]},
    );

    if (deleted.count === 0) {
      throw new HttpErrors.NotFound(
        'This account does not exist or is not associated with this organization.',
      );
    }
  }

  async updateOrganizationAccount(
    organizationId: string,
    accountId: string,
    account: Partial<Account>,
    keepUnknown = true,
  ): Promise<void> {
    // Check if updating same account
    if (account.emailAddress) {
      const accountHash = generateHash(
        account.emailAddress.toLocaleLowerCase(),
      );
      if (accountId !== accountHash) {
        throw new HttpErrors.BadRequest(
          'The given accountId does not belong to given account. ' +
            'Currently it is not allowed to change the email address.',
        );
      }
    }

    // Check if account belongs to the organization
    if (
      await this.accountsRepository.count({
        and: [{organizationId: organizationId}, {accountId: accountId}],
      })
    ) {
      const entity: AccountEntity = this._transformAccountToEntity(account);

      if (!keepUnknown) {
        Object.keys(entity).forEach(
          key => entity[key] === undefined && delete entity[key],
        );
      }

      await this.accountsRepository.updateById(accountId, entity);
    } else {
      throw new HttpErrors.Forbidden(
        'The given accountId does not belong to your organization.' +
          'You are not allowed to update this account.',
      );
    }
  }

  _transformAccountToEntity(account: Partial<Account>): AccountEntity {
    let entity: AccountEntity = new AccountEntity({
      firstName: account.firstName,
      lastName: account.lastName,
      emailAddress: account.emailAddress,
      phoneNumber: account.phoneNumber,
      jobPosition: account.jobPosition,
      userRole: account.userRole,
    });

    if (account.active !== undefined)
      entity = this._addActiveToAccountEntity(account.active, entity);

    if (account.verified !== undefined)
      entity = this._addVerifiedToAccountEntity(account.verified, entity);

    return entity;
  }

  _addActiveToAccountEntity(
    active: boolean,
    entity: AccountEntity,
  ): AccountEntity {
    const object = entity.toObject();
    object['active'] = active;
    return new AccountEntity(object);
  }

  _addVerifiedToAccountEntity(
    verified: boolean,
    entity: AccountEntity,
  ): AccountEntity {
    const object = entity.toObject();
    object['verified'] = verified;
    return new AccountEntity(object);
  }

  _transformOrganizationToEntity(
    organization: Partial<Organization>,
  ): OrganizationEntity {
    let entity: OrganizationEntity = new OrganizationEntity({
      customerId: organization.customerId,
      name: organization.name,
      picture: organization.picture,
      industryCategory: organization.industryCategory,
      address: organization.address?.country
        ? {
            country: organization.address.country,
            streetAddress: organization.address?.streetAddress,
            postalCode: organization.address?.postalCode,
            city: organization.address?.city,
          }
        : undefined,
      contactInfo: organization.contactInfo?.emailAddress
        ? {
            emailAddress: organization.contactInfo?.emailAddress,
            phoneNumber: organization.contactInfo?.phoneNumber,
            faxNumber: organization.contactInfo?.faxNumber,
            website: organization.contactInfo?.website,
          }
        : undefined,
    });

    if (organization.active !== undefined)
      entity = this._addActiveToOrganizationEntity(organization.active, entity);

    if (organization.verified !== undefined)
      entity = this._addVerifiedToOrganizationEntity(
        organization.verified,
        entity,
      );

    return entity;
  }

  _addActiveToOrganizationEntity(
    active: boolean,
    entity: OrganizationEntity,
  ): OrganizationEntity {
    const object = entity.toObject();
    object['active'] = active;
    return new OrganizationEntity(object);
  }

  _addVerifiedToOrganizationEntity(
    verified: boolean,
    entity: OrganizationEntity,
  ): OrganizationEntity {
    const object = entity.toObject();
    object['verified'] = verified;
    return new OrganizationEntity(object);
  }

  _transformEntityToOrganization(
    entity: OrganizationEntity,
    certificates?: number,
  ): Organization & {
    amountOfCertificates?: number;
  } {
    return {
      organizationId: entity.organizationId,
      customerId: entity.customerId,
      name: entity.name,
      picture: entity.picture,
      industryCategory: entity.industryCategory,
      address: entity.address,
      contactInfo: entity.contactInfo,
      active: entity.active,
      verified: entity.verified,
      amountOfCertificates: certificates,
    };
  }

  _transformEntityToAccount(entity: AccountEntity): Account {
    return {
      accountId: entity.accountId,
      firstName: entity.firstName,
      lastName: entity.lastName,
      emailAddress: entity.emailAddress,
      phoneNumber: entity.phoneNumber,
      jobPosition: entity.jobPosition,
      userRole: entity.userRole,
      active: entity.active,
      verified: entity.verified,
    };
  }
}
