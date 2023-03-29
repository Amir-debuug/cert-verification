import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongdbDataSource} from '../datasources';
import {DocumentEntity, DocumentEntityRelations} from '../entities';

export class DocumentsRepository extends DefaultCrudRepository<
  DocumentEntity,
  typeof DocumentEntity.prototype.documentId,
  DocumentEntityRelations
> {
  constructor(@inject('datasources.mongdb') dataSource: MongdbDataSource) {
    super(DocumentEntity, dataSource);
  }
}
