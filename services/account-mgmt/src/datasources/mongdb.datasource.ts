import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
import {AppConstants} from '../keys';

const config = AppConstants.ORACLEDB_SETTINGS;

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class MongdbDataSource
  extends juggler.DataSource
  implements LifeCycleObserver
{
  static dataSourceName = 'mongdb';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.mongdb', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
