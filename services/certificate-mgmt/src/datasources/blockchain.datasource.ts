import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';

const config = {
  name: 'blockchain',
  connector: 'openapi',
  spec: './src/blockchain.v1.yaml',
  validate: false,
  positional: 'bodyLast',
  authorizations: {
    basicAuth: {username: 'robert', password: 'xkM@9xn4BRfbrXCFsE_J'},
  },
};

@lifeCycleObserver('datasource')
export class BlockchainDataSource
  extends juggler.DataSource
  implements LifeCycleObserver
{
  static dataSourceName = 'blockchain';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.blockchain', {optional: true})
    dsConfig: object = config,
  ) {
    super({transformResponse, ...dsConfig});
  }
}

/**
 * Transform the http response into the return value
 */
function transformResponse(response: {
  url: string;
  method: string;
  status: number;
  statusText: string;
  headers: object;
  text: string;
  body: unknown;
}) {
  if (response.status < 400) {
    return response.body ?? response.text;
  }
  const err = HttpErrors(response.status, response.statusText, response);
  throw err;
}
