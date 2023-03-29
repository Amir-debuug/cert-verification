import {Organization} from '../../models';

export interface OrganizationService {
  getOrganization(organizationId: string): Promise<Organization>;
}
