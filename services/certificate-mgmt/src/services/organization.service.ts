import {BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {OrganizationEntity} from '../entities';
import {Organization} from '../models';
import {AccountsRepository, OrganizationsRepository} from '../repositories';
import {OrganizationService} from './interfaces';

@injectable({scope: BindingScope.TRANSIENT})
export class OrganizationServiceProvider implements OrganizationService {
  constructor(
    @repository(OrganizationsRepository)
    public organizationsRepository: OrganizationsRepository,
    @repository(AccountsRepository)
    public accountsRepository: AccountsRepository,
  ) {}

  async getOrganization(organizationId: string): Promise<Organization> {
    // Find organization by ID
    const organization: OrganizationEntity =
      await this.organizationsRepository.findById(organizationId);

    // Transform account entity to model
    return this._transformEntityToOrganization(organization);
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
}
