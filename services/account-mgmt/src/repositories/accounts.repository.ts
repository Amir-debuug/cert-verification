import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongdbDataSource} from '../datasources';
import {AccountEntity, AccountEntityRelations} from '../entities';

export class AccountsRepository extends DefaultCrudRepository<
  AccountEntity,
  typeof AccountEntity.prototype.accountId,
  AccountEntityRelations
> {
  constructor(@inject('datasources.mongdb') dataSource: MongdbDataSource) {
    super(AccountEntity, dataSource);
  }

  async getAccountById(accountId: string): Promise<AccountEntity> {
    return this.findById(accountId);
  }

}
