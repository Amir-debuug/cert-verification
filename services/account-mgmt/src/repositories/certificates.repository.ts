import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongdbDataSource} from '../datasources';
import {CertificateEntity, CertificateEntityRelations} from '../entities';

export class CertificatesRepository extends DefaultCrudRepository<
  CertificateEntity,
  typeof CertificateEntity.prototype.certificateId,
  CertificateEntityRelations
> {
  constructor(@inject('datasources.mongdb') dataSource: MongdbDataSource) {
    super(CertificateEntity, dataSource);
  }
}
