import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongdbDataSource} from '../datasources';
import { ScanEntity, ScanEntityRelations } from '../entities';

export class ScansRepository extends DefaultCrudRepository<
  ScanEntity,
  typeof ScanEntity.prototype.scanId,
  ScanEntityRelations
> {
  constructor(@inject('datasources.mongdb') dataSource: MongdbDataSource) {
    super(ScanEntity, dataSource);
  }
}
