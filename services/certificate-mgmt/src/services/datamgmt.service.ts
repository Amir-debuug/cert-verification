import {repository, Where} from '@loopback/repository';
import {UserProfile} from '@loopback/security';
import {IP2Location} from 'ip2location-nodejs';
import {CertificateEntity, AccountEntity} from '../entities';
import {
  Signature,
  Statistics,
  StatsCategory,
  StatsCertificate,
  StatsLocation,
  StatsOrganization,
} from '../models';
import {
  AccountsRepository,
  CertificatesRepository,
  OrganizationsRepository,
  ScansRepository,
} from '../repositories';
import {DataManagementService} from './interfaces';
import {generateHash} from './parser.utils';

const ip2location = new IP2Location();
ip2location.open('./bin/DB3.BIN');

export class DataManagementServiceProvider implements DataManagementService {
  constructor(
    @repository(OrganizationsRepository)
    public organizationsRepository: OrganizationsRepository,
    @repository(CertificatesRepository)
    public certificatesRepository: CertificatesRepository,
    @repository(AccountsRepository)
    public accountsRepository: AccountsRepository,
    @repository(ScansRepository)
    public scansRepository: ScansRepository,
  ) {}

  async retrieveStatistics(accountId?: string, documents: [] = []): Promise<Statistics> {
    const returnStatics: Statistics = new Statistics({
      certificates: {
        requested: 0,
        scanned: 0,
        categories: [],
      },
      accounts: {
        locations: [],
      },
      documents: []
    });

    //Get certificates statics
    returnStatics.certificates = await this.getCertificateStats(accountId);

    //Get Account statics
    returnStatics.accounts = await this.getAccountStats(
      accountId,
    );

    //Get Account statics
    returnStatics.documents = documents;
      console.log(returnStatics);
    return returnStatics;
  }

  private async getCertificateStats(
    accountId?: string,
  ): Promise<StatsCertificate> {
    const categories: StatsCategory[] = [];

    let whereClause: Where<CertificateEntity>;
    if (accountId) {
      whereClause = {
        ownerId: accountId,
      };
    }

    const certificates = await this.certificatesRepository.find({
      where: whereClause,
    });
    let scanned = 0;
    for (const cert of certificates) {
      scanned += (
        await this.scansRepository.find({
          where: {
            certificateId: cert.certificateId,
          },
        })
      ).length;
      const index = categories.map(x => x.name).indexOf(cert.category);
      if (index < 0) {
        categories.push(
          new StatsCategory({
            name: cert.category,
            percentage: (1 / certificates.length) * 100,
          }),
        );
      } else categories[index].percentage += (1 / certificates.length) * 100;
    }
    return new StatsCertificate({
      scanned: scanned,
      requested: certificates.length,
      categories: categories,
    });
  }

  private async getAccountStats(
    accountId?: string,
  ): Promise<StatsOrganization> {
    const locations: StatsLocation[] = [];

    let whereClause: Where<AccountEntity>;
    if (accountId) {
      whereClause = {
        accountId: accountId,
      };
    }

    const accounts = await this.organizationsRepository.find({
      where: whereClause,
    });
    for (const acc of accounts) {
      // Get certificates from organization
      const certificates = await this.certificatesRepository.find({
        where: {
          ownerId: acc.organizationId,
        },
      });
      for (const cert of certificates) {
        const scans = await this.scansRepository.find({
          where: {
            certificateId: cert.certificateId,
          },
        });

        // Get current account scan history
        for (const scan of scans) {
          const currentLocatoinIndex = locations.findIndex(
            x => x.city === scan.city && x.country === scan.country,
          );

          if (currentLocatoinIndex === -1) {
            locations.push(
              new StatsLocation({
                activeUsers: 1,
                city: scan.city,
                country: scan.country,
              }),
            );
          } else {
            locations[currentLocatoinIndex].activeUsers += 1;
          }
        }
      }

    }
    return new StatsOrganization({
      locations: locations,
    });
  }

  async newScannedCert(
    requester: UserProfile,
    signature: Signature,
  ): Promise<string> {
    // Init variables
    const scannedAt = new Date().toISOString();
    const scanId = generateHash(
      signature.uniqueId + '||' + requester.accountId + '||' + scannedAt,
    );
    const locationInfo = await this.ipToLocation(signature.ipAddress);

    // Get certificate
    /* const certificate = await this.certificatesRepository.findById(
      ownerId,
    ); */

    if (locationInfo !== undefined) {
      await this.scansRepository.create({
        scanId: scanId,
        //certificateId: certificate.ownerId,
        //sampleId: certificate.sampleId,
        //lotNumber: certificate.lotNumber,
        accountId: requester.accountId,
        city: locationInfo.City,
        country: locationInfo.Country,
        scannedAt: scannedAt,
      });
    }

    return scanId;
  }

  private async ipToLocation(
    ipAddress: string,
  ): Promise<{City: string; Country: string}> {
    const result = ip2location.getAll(ipAddress);
    return {
      City: result.city,
      Country: result.countryLong,
    };
  }
}
