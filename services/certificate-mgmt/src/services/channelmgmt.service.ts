/* eslint-disable @typescript-eslint/naming-convention */
import {inject, Provider} from '@loopback/core';
import {getService} from '@loopback/service-proxy';
import {BlockchainDataSource} from '../datasources';
import {ChannelName} from '../models/channel-name.model';
import {InvocationResult} from '../models/invocation-result.model';
import {Invocation} from '../models/invocation.model';

/**
 * The service interface is generated from OpenAPI spec with operations tagged
 * by Channel Management.
 * Resources in this group are related to channel management.
 */
export interface ChannelManagementService {
  /**
   * Invoke a transaction on a channel
   * @param channel Name of channel
   * @param _requestBody Invocation request
   * @returns Invocation result
   */
  invokeTransaction(
    channel: ChannelName,
    _requestBody: Invocation,
  ): Promise<InvocationResult>;

  /**
   * Invoke a query on a channel
   * @param channel Name of channel
   * @param _requestBody Invocation request
   * @returns Invocation result
   */
  invokeQuery(
    channel: ChannelName,
    _requestBody: Invocation,
  ): Promise<InvocationResult>;
}

export class ChannelManagementServiceProvider
  implements Provider<ChannelManagementService>
{
  constructor(
    // blockchain must match the name property in the datasource json file
    @inject('datasources.blockchain')
    protected dataSource: BlockchainDataSource = new BlockchainDataSource(),
  ) {}

  async value(): Promise<ChannelManagementService> {
    const service = await getService<{
      apis: {'Channel Management': ChannelManagementService};
    }>(this.dataSource);
    return service.apis['Channel Management'];
  }
}
