import {
  AuthenticationComponent,
  registerAuthenticationStrategy,
} from '@loopback/authentication';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {
  CertificateServiceBindings,
  DataManagementServiceBindings,
  NotificationServiceBindings,
  OrganizationServiceBindings,
  SessionServiceBindings,
  TokenServiceBindings,
  TokenServiceConstants,
  VerificationServiceBindings,
} from './keys';
import {MySequence} from './sequence';
import {
  CertificateServiceProvider,
  DataManagementServiceProvider,
  JWTService,
  NotificationServiceProvider,
  OrganizationServiceProvider,
  SessionServiceProvider,
} from './services';
import {VerificationServiceProvider} from './services/verification.service';
import {JWTAuthenticationStrategy} from './strategies/jwt-strategy';

export {ApplicationConfig};

export class AccountMgmtApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up application bindings
    this.setUpBindings();

    // Bind authentication component related elements
    this.component(AuthenticationComponent);
    registerAuthenticationStrategy(this, JWTAuthenticationStrategy);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }

  setUpBindings(): void {
    // Bind token bindings
    this.bind(TokenServiceBindings.TOKEN_SECRET).to(
      TokenServiceConstants.TOKEN_SECRET_VALUE,
    );

    this.bind(TokenServiceBindings.TOKEN_EXPIRES_IN).to(
      TokenServiceConstants.TOKEN_EXPIRES_IN_VALUE,
    );

    this.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(JWTService);

    // Bind certificate bindings
    this.bind(CertificateServiceBindings.CERTIFICATE_SERVICE).toClass(
      CertificateServiceProvider,
    );

    // Bind verification bindings
    this.bind(VerificationServiceBindings.VERIFICATION_SERVICE).toClass(
      VerificationServiceProvider,
    );

    // Bind Data-Management bindings
    this.bind(DataManagementServiceBindings.DATAMGMT_SERVICE).toClass(
      DataManagementServiceProvider,
    );

    // Bind organization bindings
    this.bind(OrganizationServiceBindings.ORGANIZATION_SERVICE).toClass(
      OrganizationServiceProvider,
    );

    // Bind session bindings
    this.bind(SessionServiceBindings.SESSION_SERVICE).toClass(
      SessionServiceProvider,
    );
    // Bind notification bindings
    this.bind(NotificationServiceBindings.NOTIFICATION_SERVICE).toClass(
      NotificationServiceProvider,
    );
  }
}
