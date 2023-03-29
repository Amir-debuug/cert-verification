import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongdbDataSource} from '../datasources';
import {OrganizationEntity, OrganizationEntityRelations} from '../entities';

export class OrganizationsRepository extends DefaultCrudRepository<
  OrganizationEntity,
  typeof OrganizationEntity.prototype.organizationId,
  OrganizationEntityRelations
> {
  constructor(@inject('datasources.mongdb') dataSource: MongdbDataSource) {
    super(OrganizationEntity, dataSource);
  }
}
