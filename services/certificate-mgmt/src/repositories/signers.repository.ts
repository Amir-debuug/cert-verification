import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongdbDataSource} from '../datasources';
import {SignerEntity, SignerEntityRelations} from '../entities';

export class SignersRepository extends DefaultCrudRepository<
  SignerEntity,
  typeof SignerEntity.prototype.signerId,
  SignerEntityRelations
> {
  constructor(@inject('datasources.mongdb') dataSource: MongdbDataSource) {
    super(SignerEntity, dataSource);
  }
}
