import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongdbDataSource} from '../datasources';
import {DocumentAccessPermissionEntity, DocumentAccessPermissionRelations, } from '../entities';

export class DocumentAccessPermissionsRepository extends DefaultCrudRepository<
  DocumentAccessPermissionEntity,
  typeof DocumentAccessPermissionEntity.prototype.documentId,
  DocumentAccessPermissionRelations
> {
  constructor(@inject('datasources.mongdb') dataSource: MongdbDataSource) {
    super(DocumentAccessPermissionEntity, dataSource);
  }
}
