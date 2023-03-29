import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongdbDataSource} from '../datasources';
import {SessionEntity, SessionEntityRelations} from '../entities';

export class SessionsRepository extends DefaultCrudRepository<
  SessionEntity,
  typeof SessionEntity.prototype.sessionId,
  SessionEntityRelations
> {
  constructor(@inject('datasources.mongdb') dataSource: MongdbDataSource) {
    super(SessionEntity, dataSource);
  }
}
