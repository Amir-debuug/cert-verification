import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongdbDataSource} from '../datasources';
import {CodeEntity, CodeEntityRelations} from '../entities';

export class CodesRepository extends DefaultCrudRepository<
  CodeEntity,
  typeof CodeEntity.prototype.codeId,
  CodeEntityRelations
> {
  constructor(@inject('datasources.mongdb') dataSource: MongdbDataSource) {
    super(CodeEntity, dataSource);
  }
}
