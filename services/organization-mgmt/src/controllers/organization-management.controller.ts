import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {api, operation, param, requestBody} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import * as Sentry from '@sentry/node';
import {
  AppConstants,
  NotificationServiceBindings,
  OrganizationServiceBindings,
  SessionServiceBindings,
} from '../keys';
import {
  Account,
  AccountId,
  AccountInitial,
  AccountResult,
  AccountUpdate,
  OrganizationInitial,
} from '../models';
import {OrganizationCreate} from '../models/organization-create.model';
import {OrganizationId} from '../models/organization-id.model';
import {OrganizationResult} from '../models/organization-result.model';
import {OrganizationUpdate} from '../models/organization-update.model';
import {Organization} from '../models/organization.model';
import {PageLinks} from '../models/page-links.model';
import {
  NotificationService,
  OrganizationService,
  SessionService,
} from '../services/interfaces';
import {determineLinks} from '../services/parser.utils';

Sentry.init({
  dsn: AppConstants.SENTRY_DSN,
  tracesSampleRate: AppConstants.SENTRY_RATE,
});

/**
 * The controller class is generated from OpenAPI spec with operations tagged
 * by Organization Management.
 *
 * Resources in this group are related to organization management.
 */
@api({
  components: {
    requestBodies: {
      addCommentRequest: {
        description: 'Add a new comment',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                comment: {
                  type: 'string',
                  description: 'Comment (text) to add',
                  minLength: 1,
                },
              },
              required: ['comment'],
            },
          },
        },
      },
      addDocumentRequest: {
        description: 'Add a new document',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/documentInitial',
            },
          },
        },
      },
      addSignersRequest: {
        description: 'Add new signers',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              minItems: 1,
              items: {
                $ref: '#/components/schemas/signer',
              },
            },
            examples: {},
          },
        },
      },
      createAccountRequest: {
        description: 'Create a new account',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/accountInitial',
            },
          },
        },
      },
      patchAccountRequest: {
        description: 'Patch account details',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/accountUpdate',
            },
          },
        },
      },
      updateAccountRequest: {
        description: 'Update an existing account',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/accountInitial',
            },
          },
        },
      },
      createOrganizationRequest: {
        description: 'Create a new organization',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/organizationCreate',
            },
          },
        },
      },
      patchOrganizationRequest: {
        description: 'Patch organization details',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/organizationUpdate',
            },
          },
        },
      },
      updateOrganizationRequest: {
        description: 'Update an existing organization',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/organizationInitial',
            },
          },
        },
      },
      magicCodeRequest: {
        description: 'Request Authentication Code',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/codeRequest',
            },
            examples: {
              emailAddress: {
                value: {
                  emailAddress: 'robert.muster@henkel.de',
                },
              },
            },
          },
        },
      },
      createCertificateRequest: {
        description: 'Create a new certificate',
        content: {
          'application/json': {
            schema: {
              allOf: [
                {
                  $ref: '#/components/schemas/certificateInitial',
                },
                {
                  type: 'object',
                  properties: {
                    signers: {
                      $ref: '#/components/schemas/signers',
                    },
                  },
                },
              ],
            },
          },
        },
      },
      updateCertificateRequest: {
        description: 'Update an existing certificate',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/certificate',
            },
          },
        },
      },
      verifyCertificateRequest: {
        description: 'Verify a scanned certificate',
        content: {
          'application/json': {
            schema: {
              oneOf: [
                {
                  type: 'object',
                  properties: {
                    certificateId: {
                      $ref: '#/components/schemas/certificateId',
                    },
                    documentId: {
                      $ref: '#/components/schemas/documentId',
                    },
                    createdAt: {
                      description: 'Created at unix timestamp',
                      type: 'integer',
                      format: 'int64',
                      example: 1640558567,
                    },
                    amountOfSigner: {
                      description: 'The amount of cetificate signers',
                      type: 'integer',
                      format: 'int32',
                      example: 2,
                      minimum: 1,
                    },
                  },
                  required: [
                    'certificateId',
                    'documentId',
                    'createdAt',
                    'amountOfSigners',
                  ],
                },
                {
                  type: 'object',
                  properties: {
                    fileContent: {
                      description:
                        'File content of PDF in base64 encoded string',
                      type: 'string',
                      format: 'byte',
                    },
                  },
                  required: ['fileContent'],
                },
              ],
            },
          },
        },
      },
    },
    responses: {
      badRequestError: {
        description: 'Error: Bad request',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/serviceError',
            },
            example: {
              statusCode: 400,
              name: 'badRequestError',
              message: 'The request body is invalid',
            },
          },
        },
      },
      unprocessableEntityError: {
        description: 'Error: Unprocessable Entity',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/serviceError',
            },
            example: {
              statusCode: 422,
              name: 'unprocessableEntityError',
              message: 'The request body is invalid',
              code: 'VALIDATION_FAILED',
              details: {
                path: '.account',
                code: 'required',
                message: "should have required property 'name'",
                missingProperty: 'name',
              },
            },
          },
        },
      },
      unauthorizedError: {
        description: 'Error: Unauthorized',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/serviceError',
            },
            example: {
              statusCode: 401,
              name: 'unauthorizedError',
              message: 'Missing or bad authentication',
            },
          },
        },
      },
      forbiddenError: {
        description: 'Error: Forbidden',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/serviceError',
            },
            example: {
              statusCode: 403,
              name: 'forbiddenError',
              message: 'No permission to access this resource',
            },
          },
        },
      },
      notFoundError: {
        description: 'Error: Not Found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/serviceError',
            },
            example: {
              statusCode: 404,
              name: 'notFoundError',
              message: 'Resource XXX not found',
            },
          },
        },
      },
      internalServerError: {
        description: 'Error: Internal Server Error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/serviceError',
            },
            example: {
              statusCode: 500,
              name: 'internalServerError',
              message: 'Not Implemented',
            },
          },
        },
      },
      addDocumentResponse: {
        description: 'Successful added document',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/documentResult',
            },
            examples: {},
          },
        },
      },
      addSignersResponse: {
        description: 'Successful document creation',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/accountResult',
              },
            },
            examples: {},
          },
        },
      },
      authenticateResponse: {
        description: 'Successful authentication',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/authResult',
            },
            examples: {
              internalUser: {
                value: {
                  token:
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJUcmFjaWZpZXIiLCJzdWIiOiI2MzRhZmFmYWZhMjM0NjJhZmFmYTYyMzU0NjcyYWZhZmE3MjM1YWZhIiwiY3VzIjoiYzA2NzEwMjAxNGIyYTE2MTAzZmRkOTFhNTA2NzJjMTZmODBjYmM5YiIsImRldiI6IjI2NDRiMjUyMDJkMjU2MWQ2MTk0MDc4YTZiNTBkMzM5Iiwicm9sZSI6ImludGVybmFsIiwiaWF0IjoxNjM3ODY5MDAxLCJleHAiOjE2NDc0NjEwMDF9.7ejjxARFQcPcq6Jvfm9_hZxTvr1jvSNQuCeeERsPXWg',
                },
              },
              organizationAdmin: {
                value: {
                  token:
                    'eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJUcmFjaWZpZXIiLCJzdWIiOiIyNDFkMTM3ZTcyMDFmZTFkOTRmY2E3YjllYTAyMWYzZTNmZTA4OTMzIiwiY3VzIjoiMWE1MDY3MmMxNmY4MGNiYzliYzA2NzEwMjAxNGIyYTE2MTAzZmRkOSIsImRldiI6Ijc1YjFkNDYxMjZhNjUwMGI4MWM1MzQ2Njg4MGFhNjU5Iiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNjM3ODY5MDAxLCJleHAiOjE2NDc0NjEwMDF9.lybFYz0zph9r7qJf0_L_lX0nBku7ECeZ3uRDWQzGluA',
                },
              },
              organizationUser: {
                value: {
                  token:
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJUcmFjaWZpZXIiLCJzdWIiOiJmZWRjYmE5ODc2NTQzMjExMjM0NTY3ODk4NzY1NDMyMTIzNDU2Nzg4IiwiY3VzIjoiMWE1MDY3MmMxNmY4MGNiYzliYzA2NzEwMjAxNGIyYTE2MTAzZmRkOSIsImRldiI6IjRjNmUzNzQ2M2M4ZWRhNmU0OTQ1NDRlYjhiMDI1ZDVmIiwicm9sZSI6InVzZXIiLCJpYXQiOjE2Mzc4NjkwMDEsImV4cCI6MTY0NzQ2MTAwMX0.NWCXIANmetMW5BvppWKrGoe_27f1d_zsKJsBZIz0jAM',
                },
              },
            },
          },
        },
      },
      getCertHistoryResponse: {
        description: 'Certificate history',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/certificateHistory',
            },
          },
        },
      },
      createAccountResponse: {
        description: 'Successful account creation',
        headers: {
          Location: {
            schema: {
              type: 'string',
            },
          },
        },
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/accountResult',
            },
          },
        },
      },
      createOrganizationResponse: {
        description: 'Successful organization creation',
        headers: {
          Location: {
            schema: {
              type: 'string',
              example:
                '/organizations/1a50672c16f80cbc9bc067102014b2a16103fdd9',
            },
          },
        },
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/organizationResult',
            },
            examples: {
              henkel: {
                value: {
                  organizationId: '1a50672c16f80cbc9bc067102014b2a16103fdd9',
                },
              },
            },
          },
        },
      },
      getAccountResponse: {
        description: 'Account details',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/account',
            },
            examples: {
              organizationAccount: {
                value: {
                  accountId: '241d137e7201fe1d94fca7b9ea021f3e3fe08933',
                  firstName: 'Robert ',
                  lastName: ' Munster',
                  emailAddress: 'robert.muster@henkel.de',
                  phoneNumber: '+49625260933',
                  jobPosition: 'Food importer',
                  userRole: 'user',
                  verified: true,
                  active: true,
                },
              },
              internalAccount: {
                value: {
                  accountId: '634afafafa23462afafa62354672afafa7235afa',
                  firstName: 'Max ',
                  lastName: ' Muster',
                  emailAddress: 'max.muster@galab.de',
                  phoneNumber: '+491525555019',
                  jobPosition: 'Galab Admin',
                  userRole: 'internal',
                  verified: true,
                  active: true,
                },
              },
            },
          },
        },
      },
      getAccountsResponse: {
        description: 'List of accounts',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                _links: {
                  $ref: '#/components/schemas/pageLinks',
                },
                count: {
                  description: 'Amount of retrieved results',
                  type: 'integer',
                  format: 'int32',
                  minimum: 0,
                  maximum: 10,
                },
                total: {
                  description: 'Amount of available results',
                  type: 'integer',
                  format: 'int32',
                  minimum: 0,
                },
                organization: {
                  description: 'Name of organization',
                  type: 'string',
                },
                accounts: {
                  type: 'array',
                  minItems: 1,
                  items: {
                    $ref: '#/components/schemas/account',
                  },
                },
              },
              required: ['_links', 'count', 'total'],
            },
            examples: {
              henkelAccountsLast5: {
                value: {
                  _links: {
                    self: '/organization-mgmt/organizations/1a50672c16f80cbc9bc067102014b2a16103fdd9/accounts/accounts?limit=5&offset=0&filter=desc:createdAt',
                    first:
                      '/organization-mgmt/organizations/1a50672c16f80cbc9bc067102014b2a16103fdd9/accounts/accounts?limit=1&offset=0&filter=desc:createdAt',
                    next: '/organization-mgmt/organizations/1a50672c16f80cbc9bc067102014b2a16103fdd9/accounts/accounts?limit=5&offset=5&filter=desc:createdAt',
                    last: '/organization-mgmt/organizations/1a50672c16f80cbc9bc067102014b2a16103fdd9/accounts/accounts?limit=5&offset=5&filter=desc:createdAt',
                  },
                  count: 5,
                  total: 7,
                  organization: 'Henkel AG & Co',
                  accounts: [
                    {
                      accountId: '241d137e7201fe1d94fca7b9ea021f3e3fe08933',
                      firstName: 'Robert ',
                      lastName: ' Munster',
                      emailAddress: 'robert.munster@henkel.de',
                      phoneNumber: '+49625260933',
                      jobPosition: 'Food importer',
                      userRole: 'admin',
                      verified: true,
                      active: true,
                    },
                    {
                      accountId: 'fedcba9876543211234567898765432123456788',
                      firstName: 'Winfried ',
                      lastName: ' Kiefer',
                      emailAddress: 'winfried.kiefer@henkel.de',
                      phoneNumber: '+491575556261',
                      jobPosition: 'Consultant',
                      userRole: 'user',
                      verified: true,
                      active: true,
                    },
                    {
                      accountId: 'abcdef1234567891234568887456534523243231',
                      firstName: 'Friederic ',
                      lastName: ' Pfeiffer',
                      emailAddress: 'friederic.pfeiffer@henkel.de',
                      phoneNumber: '+491515554103',
                      jobPosition: 'Food importer',
                      userRole: 'user',
                      verified: true,
                      active: true,
                    },
                    {
                      accountId: 'deeefa1234567891234568887456534523243235',
                      firstName: 'Winfried ',
                      lastName: ' Kiefer',
                      emailAddress: 'helene.waltz@henkel.de',
                      phoneNumber: '+491525551298',
                      jobPosition: 'Sales',
                      userRole: 'signer',
                      verified: true,
                      active: true,
                    },
                    {
                      accountId: '765476345afdefafed3534263546235467233562',
                      firstName: 'Magdalene ',
                      lastName: ' Mayer',
                      emailAddress: 'magdalene.mayar@henkel.de',
                      phoneNumber: '+491635553312',
                      jobPosition: 'Sales',
                      userRole: 'user',
                      verified: true,
                      active: true,
                    },
                  ],
                },
              },
              galabInternalAll: {
                value: {
                  _links: {
                    self: '/organization-mgmt/organizations/80cbc9bc067102014b2a16103fdd91a50672c16f/accounts',
                    first:
                      '/organization-mgmt/organizations/80cbc9bc067102014b2a16103fdd91a50672c16f/accounts?limit=1&offset=0',
                    last: '/organization-mgmt/organizations/80cbc9bc067102014b2a16103fdd91a50672c16f/accounts?limit=1&offset=2',
                  },
                  count: 3,
                  total: 3,
                  organization: 'GALAB Laboratories',
                  accounts: [
                    {
                      accountId: '634afafafa23462afafa62354672afafa7235afa',
                      firstName: 'max ',
                      lastName: ' muster',
                      emailAddress: 'max.muster@galab.de',
                      phoneNumber: '+491525555019',
                      jobPosition: 'Galab Admin',
                      userRole: 'internal',
                      verified: true,
                      active: true,
                    },
                    {
                      accountId: 'afafa62354672afafa7235afa634afafafa23462',
                      firstName: 'Ilma ',
                      lastName: ' Schneider',
                      emailAddress: 'ilma.schneider@galab.de',
                      phoneNumber: '+491525558792',
                      jobPosition: 'Sales',
                      userRole: 'internal',
                      verified: true,
                      active: true,
                    },
                    {
                      accountId: '62354672afafa7235afa634afafafa23462afafa',
                      firstName: 'Karsten ',
                      lastName: ' Wagner',
                      emailAddress: 'karsten.wagner@galab.de',
                      phoneNumber: '+491575554429',
                      jobPosition: 'Sales',
                      userRole: 'internal',
                      verified: true,
                      active: true,
                    },
                  ],
                },
              },
            },
          },
        },
      },
      getCommentsResponse: {
        description: 'List of comments',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/comment',
              },
            },
          },
        },
      },
      getOrganizationResponse: {
        description: 'Organization details',
        content: {
          'application/json': {
            schema: {
              allOf: [
                {
                  $ref: '#/components/schemas/organization',
                },
                {
                  type: 'object',
                  properties: {
                    accounts: {
                      description: 'List of associated accounts',
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/account',
                      },
                    },
                  },
                  required: ['accounts'],
                },
              ],
            },
            examples: {
              henkel: {
                value: {
                  organizationId: '1a50672c16f80cbc9bc067102014b2a16103fdd9',
                  customerId: 'GI129851',
                  name: 'Henkel AG & Co',
                  picture:
                    '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',
                  address: {
                    streetAddress: 'Erlengang 31',
                    postalCode: '22844',
                    city: 'Norderstedt',
                    country: 'Germany',
                  },
                  industryCategory: ['Product Testing'],
                  contactInfo: {
                    emailAddress: 'info@henkel.de',
                    phoneNumber: '+494052601100',
                    faxNumber: '+494052601101',
                    website: 'https://henkel.de',
                  },
                  verified: true,
                  active: true,
                  accounts: [
                    {
                      accountId: '241d137e7201fe1d94fca7b9ea021f3e3fe08933',
                      firstName: 'Robert ',
                      lastName: ' Munster',
                      emailAddress: 'robert.munster@henkel.de',
                      phoneNumber: '+49625260933',
                      jobPosition: 'Food importer',
                      userRole: 'admin',
                      verified: true,
                      active: true,
                    },
                    {
                      accountId: 'fedcba9876543211234567898765432123456788',
                      firstName: 'Winfried ',
                      lastName: ' Kiefer',
                      emailAddress: 'winfried.kiefer@henkel.de',
                      phoneNumber: '+491575556261',
                      jobPosition: 'Consultant',
                      userRole: 'user',
                      verified: true,
                      active: true,
                    },
                    {
                      accountId: 'abcdef1234567891234568887456534523243231',
                      firstName: 'Friederic ',
                      lastName: ' Pfeiffer',
                      emailAddress: 'friederic.pfeiffer@henkel.de',
                      phoneNumber: '+491515554103',
                      jobPosition: 'Food importer',
                      userRole: 'user',
                      verified: true,
                      active: true,
                    },
                    {
                      accountId: 'deeefa1234567891234568887456534523243235',
                      firstName: 'Helene ',
                      lastName: ' Waltz',
                      emailAddress: 'helene.waltz@henkel.de',
                      phoneNumber: '+491525551298',
                      jobPosition: 'Sales',
                      userRole: 'signer',
                      verified: true,
                      active: true,
                    },
                    {
                      accountId: '765476345afdefafed3534263546235467233562',
                      firstName: 'Magdalene ',
                      lastName: ' Mayer',
                      emailAddress: 'magdalene.mayar@henkel.de',
                      phoneNumber: '+491635553312',
                      jobPosition: 'Sales',
                      userRole: 'user',
                      verified: true,
                      active: true,
                    },
                  ],
                },
              },
              proctergamble: {
                value: {
                  organizationId: 'c9bc067102014b2a16103fdd91a50672c16f80cb',
                  name: 'Procter & Gamble',
                  address: {
                    country: 'Germany',
                  },
                  contactInfo: {
                    emailAddress: 'info@de.pg.com',
                    website: 'https://de.pg.com/',
                  },
                  verified: false,
                  active: true,
                  accounts: [
                    {
                      accountId: '94fca7b9ea021f3e3fe08933241d137e7201fe1d',
                      firstName: 'Helfried ',
                      lastName: ' Müller',
                      emailAddress: 'hmuller@de.pg.com',
                      phoneNumber: '+49625331011',
                      jobPosition: 'Importer',
                      userRole: 'admin',
                      verified: true,
                      active: true,
                    },
                  ],
                },
              },
            },
          },
        },
      },
      getOrganizationsResponse: {
        description: 'List of organizations',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                _links: {
                  $ref: '#/components/schemas/pageLinks',
                },
                count: {
                  description: 'Amount of retrieved results',
                  type: 'integer',
                  format: 'int32',
                  minimum: 0,
                  maximum: 10,
                },
                total: {
                  description: 'Amount of available results',
                  type: 'integer',
                  format: 'int32',
                  minimum: 0,
                },
                organizations: {
                  type: 'array',
                  minItems: 1,
                  items: {
                    allOf: [
                      {
                        $ref: '#/components/schemas/organization',
                      },
                      {
                        type: 'object',
                        properties: {
                          amountOfCertificates: {
                            description: 'Amount of requested certicates',
                            type: 'integer',
                            format: 'int32',
                            minimum: 0,
                            example: 3,
                          },
                        },
                      },
                    ],
                  },
                },
              },
              required: ['_links', 'count', 'total'],
            },
            examples: {
              allOrganizations: {
                value: {
                  _links: {
                    self: '/organization-mgmt/organizations?offset=0',
                    first: '/organization-mgmt/organizations?offset=0',
                    last: '/organization-mgmt/organizations?offset=0',
                  },
                  count: 2,
                  total: 2,
                  organizations: [
                    {
                      organizationId:
                        '1a50672c16f80cbc9bc067102014b2a16103fdd9',
                      customerId: 'GI129851',
                      name: 'Henkel AG & Co',
                      picture:
                        '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',
                      address: {
                        streetAddress: 'Erlengang 31',
                        postalCode: '22844',
                        city: 'Norderstedt',
                        country: 'Germany',
                      },
                      industryCategory: ['Product Testing'],
                      contactInfo: {
                        emailAddress: 'info@henkel.de',
                        phoneNumber: '+494052601100',
                        faxNumber: '+494052601101',
                        website: 'https://henkel.de',
                      },
                      verified: true,
                      active: true,
                      amountOfCertificates: 3,
                    },
                    {
                      organizationId:
                        'c9bc067102014b2a16103fdd91a50672c16f80cb',
                      name: 'Procter & Gamble',
                      address: {
                        country: 'Germany',
                      },
                      contactInfo: {
                        emailAddress: 'info@de.pg.com',
                        website: 'https://de.pg.com/',
                      },
                      verified: false,
                      active: true,
                      amountOfCertificates: 0,
                    },
                  ],
                },
              },
            },
          },
        },
      },
      createCertificateResponse: {
        description: 'Successful certificate creation',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/certificateResult',
            },
          },
        },
      },
      getCertificateResponse: {
        description: 'Succesful certificate retrievel',
        content: {
          'application/json': {
            schema: {
              allOf: [
                {
                  $ref: '#/components/schemas/certificate',
                },
                {
                  type: 'object',
                  properties: {
                    signers: {
                      description: 'List of signers',
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/signer',
                      },
                    },
                    documents: {
                      description: 'List of documents',
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/document',
                      },
                    },
                  },
                },
              ],
            },
            examples: {},
          },
        },
      },
      getCertificatesResponse: {
        description: 'List of certificates',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                _links: {
                  $ref: '#/components/schemas/pageLinks',
                },
                count: {
                  type: 'integer',
                  format: 'int32',
                  minimum: 0,
                  maximum: 100,
                },
                total: {
                  type: 'integer',
                  format: 'int32',
                  minimum: 0,
                },
                certificates: {
                  type: 'array',
                  items: {
                    allOf: [
                      {
                        $ref: '#/components/schemas/certificate',
                      },
                      {
                        type: 'object',
                        properties: {
                          document: {
                            $ref: '#/components/schemas/document',
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            examples: {
              allCertificates: {
                value: {
                  _links: {
                    self: '/certificate-mgmt/certificates?limit=5&offset=5',
                    first: '/certificate-mgmt/certificates?limit=5&offset=0',
                    prev: '/certificate-mgmt/certificates?limit=5&offset=0',
                    next: '/certificate-mgmt/certificates?limit=5&offset=10',
                    last: '/certificate-mgmt/certificates?limit=5&offset=55',
                  },
                  count: 0,
                  total: 0,
                  certificates: [
                    {
                      certificateId: '3ab35386c0c7fe155e93024bf80e3c574c5818b5',
                      organization: {
                        organizationId:
                          '1a50672c16f80cbc9bc067102014b2a16103fdd9',
                        name: 'Henkel AG & Co',
                        picture:
                          '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',
                      },
                      sampleId: 'SA11098762',
                      lotNumber: 'LR102SS9774',
                      product: 'Coffee',
                      category: 'Food',
                      requestedBy: {
                        accountId: '241d137e7201fe1d94fca7b9ea021f3e3fe08933',
                        name: 'Robert Munster',
                        emailAddress: 'robert.muster@henkel.de',
                      },
                      document: {
                        documentId: '59d68b9b058a4c104ceaf596cf6ce4033cc0a7f4',
                        name: '20211113-15267-cert',
                        fileContent:
                          'JVBERi0xLjYNJeLjz9MNCjI0IDAgb2JqDTw8L0ZpbHRlci9GbGF0ZURlY29kZS9GaXJzdCA0L0xlbmd0aCAyMTYvTiAxL1R5cGUvT2JqU3RtPj5zdHJlYW0NCmjePI9RS8MwFIX/yn1bi9jepCQ6GYNpFBTEMsW97CVLbjWYNpImmz/fVsXXcw/f/c4SEFarepPTe4iFok8dU09DgtDBQx6TMwT74vaLTE7uSPDUdXM0Xe/73r1FnVwYYEtHR6d9WdY3kX4ipRMV6oojSmxQMoGyac5RLBAXf63p38aGA7XPorLewyvFcYaJile8rB+D/YcwiRdMMGScszO8/IW0MdhsaKKYGA46gXKTr/cUQVY4We/cYMNpnLVeXPJUXHs9fECr7kAFk+eZ5Xr9LcAAfKpQrA0KZW5kc3RyZWFtDWVuZG9iag0yNSAwIG9iag08PC9GaWx0ZXIvRmxhdGVEZWNvZGUvRmlyc3QgNC9MZW5ndGggNDkvTiAxL1R5cGUvT2JqU3RtPj5zdHJlYW0NCmjeslAwULCx0XfOL80rUTDU985MKY42NAIKBsXqh1QWpOoHJKanFtvZAQQYAN/6C60NCmVuZHN0cmVhbQ1lbmRvYmoNMjYgMCBvYmoNPDwvRmlsdGVyL0ZsYXRlRGVjb2RlL0ZpcnN0IDkvTGVuZ3RoIDQyL04gMi9UeXBlL09ialN0bT4+c3RyZWFtDQpo3jJTMFAwVzC0ULCx0fcrzS2OBnENFIJi7eyAIsH6LnZ2AAEGAI2FCDcNCmVuZHN0cmVhbQ1lbmRvYmoNMjcgMCBvYmoNPDwvRmlsdGVyL0ZsYXRlRGVjb2RlL0ZpcnN0IDUvTGVuZ3RoIDEyMC9OIDEvVHlwZS9PYmpTdG0+PnN0cmVhbQ0KaN4yNFIwULCx0XfOzytJzSspVjAyBgoE6TsX5Rc45VdEGwB5ZoZGCuaWRrH6vqkpmYkYogGJRUCdChZgfUGpxfmlRcmpxUAzA4ryk4NTS6L1A1zc9ENSK0pi7ez0g/JLEktSFQz0QyoLUoF601Pt7AACDADYoCeWDQplbmRzdHJlYW0NZW5kb2JqDTIgMCBvYmoNPDwvTGVuZ3RoIDM1MjUvU3VidHlwZS9YTUwvVHlwZS9NZXRhZGF0YT4+c3RyZWFtDQo8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/Pgo8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjQtYzAwNSA3OC4xNDczMjYsIDIwMTIvMDgvMjMtMTM6MDM6MDMgICAgICAgICI+CiAgIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgICAgIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAgICAgICAgICAgIHhtbG5zOnBkZj0iaHR0cDovL25zLmFkb2JlLmNvbS9wZGYvMS4zLyIKICAgICAgICAgICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICAgICAgICAgICB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIKICAgICAgICAgICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIj4KICAgICAgICAgPHBkZjpQcm9kdWNlcj5BY3JvYmF0IERpc3RpbGxlciA2LjAgKFdpbmRvd3MpPC9wZGY6UHJvZHVjZXI+CiAgICAgICAgIDx4bXA6Q3JlYXRlRGF0ZT4yMDA2LTAzLTA2VDE1OjA2OjMzLTA1OjAwPC94bXA6Q3JlYXRlRGF0ZT4KICAgICAgICAgPHhtcDpDcmVhdG9yVG9vbD5BZG9iZVBTNS5kbGwgVmVyc2lvbiA1LjIuMjwveG1wOkNyZWF0b3JUb29sPgogICAgICAgICA8eG1wOk1vZGlmeURhdGU+MjAxNi0wNy0xNVQxMDoxMjoyMSswODowMDwveG1wOk1vZGlmeURhdGU+CiAgICAgICAgIDx4bXA6TWV0YWRhdGFEYXRlPjIwMTYtMDctMTVUMTA6MTI6MjErMDg6MDA8L3htcDpNZXRhZGF0YURhdGU+CiAgICAgICAgIDx4bXBNTTpEb2N1bWVudElEPnV1aWQ6ZmYzZGNmZDEtMjNmYS00NzZmLTgzOWEtM2U1Y2FlMmRhMmViPC94bXBNTTpEb2N1bWVudElEPgogICAgICAgICA8eG1wTU06SW5zdGFuY2VJRD51dWlkOjM1OTM1MGIzLWFmNDAtNGQ4YS05ZDZjLTAzMTg2YjRmZmIzNjwveG1wTU06SW5zdGFuY2VJRD4KICAgICAgICAgPGRjOmZvcm1hdD5hcHBsaWNhdGlvbi9wZGY8L2RjOmZvcm1hdD4KICAgICAgICAgPGRjOnRpdGxlPgogICAgICAgICAgICA8cmRmOkFsdD4KICAgICAgICAgICAgICAgPHJkZjpsaSB4bWw6bGFuZz0ieC1kZWZhdWx0Ij5CbGFuayBQREYgRG9jdW1lbnQ8L3JkZjpsaT4KICAgICAgICAgICAgPC9yZGY6QWx0PgogICAgICAgICA8L2RjOnRpdGxlPgogICAgICAgICA8ZGM6Y3JlYXRvcj4KICAgICAgICAgICAgPHJkZjpTZXE+CiAgICAgICAgICAgICAgIDxyZGY6bGk+RGVwYXJ0bWVudCBvZiBKdXN0aWNlIChFeGVjdXRpdmUgT2ZmaWNlIG9mIEltbWlncmF0aW9uIFJldmlldyk8L3JkZjpsaT4KICAgICAgICAgICAgPC9yZGY6U2VxPgogICAgICAgICA8L2RjOmNyZWF0b3I+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgCjw/eHBhY2tldCBlbmQ9InciPz4NCmVuZHN0cmVhbQ1lbmRvYmoNMTEgMCBvYmoNPDwvTWV0YWRhdGEgMiAwIFIvUGFnZUxhYmVscyA2IDAgUi9QYWdlcyA4IDAgUi9UeXBlL0NhdGFsb2c+Pg1lbmRvYmoNMjMgMCBvYmoNPDwvRmlsdGVyL0ZsYXRlRGVjb2RlL0xlbmd0aCAxMD4+c3RyZWFtDQpIiQIIMAAAAAABDQplbmRzdHJlYW0NZW5kb2JqDTI4IDAgb2JqDTw8L0RlY29kZVBhcm1zPDwvQ29sdW1ucyA0L1ByZWRpY3RvciAxMj4+L0ZpbHRlci9GbGF0ZURlY29kZS9JRFs8REI3Nzc1Q0NFMjI3RjZCMzBDNDQwREY0MjIxREMzOTA+PEJGQ0NDRjNGNTdGNjEzNEFCRDNDMDRBOUU0Q0ExMDZFPl0vSW5mbyA5IDAgUi9MZW5ndGggODAvUm9vdCAxMSAwIFIvU2l6ZSAyOS9UeXBlL1hSZWYvV1sxIDIgMV0+PnN0cmVhbQ0KaN5iYgACJjDByGzIwPT/73koF0wwMUiBWYxA4v9/EMHA9I/hBVCxoDOQeH8DxH2KrIMIglFwIpD1vh5IMJqBxPpArHYgwd/KABBgAP8bEC0NCmVuZHN0cmVhbQ1lbmRvYmoNc3RhcnR4cmVmDQo0NTc2DQolJUVPRg0K',
                        reportId: 'RP-SA11098762-1',
                        status: 'sent',
                        requestedAt: '2021-12-02T20:21:12.020Z',
                        validUntil: '2022-03-01T00:00:00.000Z',
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      getDocumentResponse: {
        description: 'Download PDF certificate',
        content: {
          'application/pdf': {
            schema: {
              type: 'string',
              format: 'binary',
            },
            examples: {},
          },
        },
      },
      statisticsResponse: {
        description: 'Successful authentication',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/statistics',
            },
            examples: {
              internalStatistics: {
                value: {
                  certificates: {
                    scanned: 3410,
                    requested: 303,
                    categories: [
                      {
                        name: 'Food',
                        percentage: 56,
                      },
                      {
                        name: 'Product Testing',
                        percentage: 34,
                      },
                      {
                        name: 'Other',
                        percentage: 10,
                      },
                    ],
                  },
                  organizations: {
                    totalUsers: 20,
                    locations: [
                      {
                        activeUsers: 4,
                        city: 'Amsterdam',
                        country: 'Netherlands',
                      },
                      {
                        activeUsers: 10,
                        city: 'Hamburg',
                        country: 'Germany',
                      },
                      {
                        activeUsers: 6,
                        city: 'Paris',
                        country: 'France',
                      },
                    ],
                  },
                },
              },
              organizationStatistics: {
                value: {
                  certificates: {
                    scanned: 100,
                    requested: 10,
                    categories: [
                      {
                        name: 'Food',
                        percentage: 60,
                      },
                      {
                        name: 'Product Testing',
                        percentage: 40,
                      },
                    ],
                  },
                  organizations: {
                    totalUsers: 10,
                    locations: [
                      {
                        activeUsers: 10,
                        city: 'Hamburg',
                        country: 'Germany',
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
      verifyCertificateResponse: {
        description: 'Certificate verification status',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                isValid: {
                  description: 'Indicates if certificate is valid',
                  type: 'boolean',
                  example: true,
                },
                certificate: {
                  $ref: '#/components/schemas/certificate',
                },
              },
              required: ['isValid'],
            },
          },
        },
      },
    },
    parameters: {
      accountIdParam: {
        name: 'accountId',
        in: 'path',
        required: true,
        schema: {
          $ref: '#/components/schemas/accountId',
        },
        description: 'Id of the account',
      },
      codeParam: {
        name: 'X-Tracifier-Client-Verification',
        in: 'header',
        description: 'The auth code value send to user via email',
        required: true,
        schema: {
          type: 'string',
        },
      },
      organizationIdParam: {
        name: 'organizationId',
        in: 'path',
        required: true,
        schema: {
          $ref: '#/components/schemas/organizationId',
        },
        description: 'Id of the organization',
      },
      certificateIdParam: {
        name: 'certificateId',
        in: 'path',
        required: true,
        schema: {
          $ref: '#/components/schemas/certificateId',
        },
      },
      documentIdParam: {
        name: 'documentId',
        in: 'path',
        required: true,
        schema: {
          $ref: '#/components/schemas/documentId',
        },
      },
      offsetParam: {
        name: 'offset',
        in: 'query',
        schema: {
          type: 'integer',
          minimum: 0,
          default: 0,
        },
        required: false,
        description:
          'The number of items to skip before starting to collect the result set.',
      },
      limitParam: {
        name: 'limit',
        in: 'query',
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 20,
        },
        required: false,
        description: 'The number of items to return.',
      },
      filterOnParam: {
        name: 'filter',
        in: 'query',
        explode: false,
        schema: {
          type: 'string',
          pattern:
            '^([,]?[a-zA-Z]+:(?:eq|gt|gte|lt|lte|like|ilike):[a-zA-ZÀ-ž0-9-:.]+)*$',
        },
        description:
          'The fields to filter result on using format: `fieldname:operator:value`. \nSeparate multiple fiters by a comma.\n|operator|Purpose|\n|--------|-------|\n|eq|Field value equals given value|\n|gt|Field value greater then given value|\n|lt|Field value lesser then given value|\n|gte|Field value greater then / equals given value|\n|lte|Field value lesser then / equals given value|',
        examples: {
          createdAt: {
            value: 'createdAt:gte:2021-12-01T00:00:00Z',
          },
          organizationId: {
            value: 'organizationId:eq:1a50672c16f80cbc9bc067102014b2a16103fdd9',
          },
        },
      },
      sortByParam: {
        name: 'sort',
        in: 'query',
        explode: false,
        schema: {
          type: 'string',
          pattern: '^(?:desc|asc):[a-zA-Z]+$',
        },
        description:
          'The fields to sort result by using format: `operator:fieldname`.\nSeparate multiple sort fields by a comma.\n|operator|Purpose|\n|--------|-------|\n|asc|Ascending|\n|desc|Descending|',
        examples: {
          decending: {
            value: 'desc:createdAt',
          },
          ascending: {
            value: 'asc:name',
          },
        },
      },
      signatureParam: {
        name: 'X-Tracifier-Client-Signature',
        in: 'header',
        description: 'Device signature',
        required: true,
        schema: {
          format: 'byte',
          type: 'string',
        },
        example:
          'eyAiZGV2aWNlSWQiOiAiMmI2ZjBjYzkwNGQxMzdiZTJlMTczMDIzNWY1NjY0MDk0YjgzMTE4NiIgfQ==',
      },
    },
    schemas: {
      serviceError: {
        description: 'Service error details',
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              statusCode: {
                type: 'integer',
                description: 'The status code as a number',
                example: 404,
              },
              name: {
                type: 'string',
                description:
                  'The name of the error as a "bumpy case", i.e. NotFound or  internalServerError.',
              },
              message: {
                type: 'string',
                description:
                  'The traditional error message, which should be kept short and  all single line',
                example: "The object you're looking for cannot be found",
              },
              code: {
                type: 'string',
                description: 'The application error code',
              },
              details: {
                type: 'array',
                items: {
                  type: 'object',
                },
                description: 'The application error details',
                example: [
                  {
                    stacktrace: 'detailed error trace',
                    linenumber: 203,
                  },
                ],
              },
            },
            required: ['statusCode', 'name'],
          },
        },
      },
      accountInitial: {
        description: 'Initial account details',
        type: 'object',
        properties: {
          firstName: {
            type: 'string',
            description: 'fisrt Name of account',
          },
          lastName: {
            type: 'string',
            description: 'last Name of account',
          },
          emailAddress: {
            type: 'string',
            format: 'email',
            description: 'Email address of account',
          },
          phoneNumber: {
            type: 'string',
            pattern:
              '^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$',
            description: 'Mobile telephone number of account',
          },
          jobPosition: {
            type: 'string',
            description: 'Job position of account holder',
          },
          userRole: {
            $ref: '#/components/schemas/userRole',
          },
        },
        required: ['firstName', 'lastName', 'emailAddress', 'userRole'],
      },
      account: {
        description: 'Account details',
        type: 'object',
        allOf: [
          {
            type: 'object',
            properties: {
              accountId: {
                $ref: '#/components/schemas/accountId',
              },
            },
            required: ['accountId'],
          },
          {
            $ref: '#/components/schemas/accountInitial',
          },
          {
            type: 'object',
            properties: {
              verified: {
                type: 'boolean',
                description: 'Indication account is verified',
              },
              active: {
                type: 'boolean',
                description: 'Indication account is active',
              },
            },
            required: ['verified', 'active'],
          },
        ],
      },
      accountUpdate: {
        description: 'Update account details',
        type: 'object',
        properties: {
          verified: {
            type: 'boolean',
            description: 'Indication account is verified',
          },
          active: {
            type: 'boolean',
            description: 'Indication account is active',
          },
        },
      },
      address: {
        description: 'Address details',
        type: 'object',
        properties: {
          streetAddress: {
            type: 'string',
            description: 'Name and number of street',
          },
          postalCode: {
            type: 'string',
            description: 'Postalcode of address',
          },
          city: {
            type: 'string',
            description: 'Name of city',
          },
          country: {
            type: 'string',
            description: 'Country of address',
          },
        },
        required: ['country'],
      },
      assignedAccount: {
        description: 'Assigned account details',
        type: 'object',
        properties: {
          accountId: {
            $ref: '#/components/schemas/accountId',
          },
          name: {
            type: 'string',
            description: 'Name of account / user / signer',
          },
          emailAddress: {
            type: 'string',
            format: 'email',
            description: 'Email address of signer',
          },
        },
        required: ['accountId'],
      },
      assignedOrganization: {
        description: 'Assigned organization details',
        type: 'object',
        properties: {
          organizationId: {
            $ref: '#/components/schemas/organizationId',
          },
          name: {
            type: 'string',
            description: 'Name of organization',
          },
          picture: {
            type: 'string',
            description: 'Profile picture',
            example:
              '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',
          },
        },
        required: ['organizationId'],
      },
      contactInfo: {
        description: 'Contract info details',
        type: 'object',
        properties: {
          emailAddress: {
            type: 'string',
            format: 'email',
            description: 'General email address',
          },
          phoneNumber: {
            type: 'string',
            pattern:
              '^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$',
            description: 'General telephone number',
          },
          faxNumber: {
            type: 'string',
            pattern:
              '^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$',
            description: 'General fax number',
          },
          website: {
            type: 'string',
            format: 'uri',
            description: 'URL of company website',
          },
        },
        required: ['emailAddress'],
      },
      comment: {
        description: 'Comment details',
        type: 'object',
        properties: {
          commentId: {
            $ref: '#/components/schemas/commentId',
          },
          comment: {
            type: 'string',
            description: 'Comment (text) to add',
            minLength: 1,
          },
        },
        required: ['commentId', 'comment'],
      },
      organizationInitial: {
        description: 'Initial organization details',
        type: 'object',
        properties: {
          customerId: {
            type: 'string',
            description: 'External reference of organization',
          },
          name: {
            type: 'string',
            description: 'Name of organization',
          },
          picture: {
            type: 'string',
            description: 'Profile picture',
          },
          address: {
            $ref: '#/components/schemas/address',
          },
          industryCategory: {
            type: 'array',
            items: {
              type: 'string',
              description: 'Industry the company is active in',
              default: 'Food',
            },
          },
          contactInfo: {
            $ref: '#/components/schemas/contactInfo',
          },
        },
        required: ['name', 'address', 'contactInfo'],
      },
      organization: {
        description: 'Organization details',
        type: 'object',
        allOf: [
          {
            type: 'object',
            properties: {
              organizationId: {
                $ref: '#/components/schemas/organizationId',
              },
            },
            required: ['organizationId'],
          },
          {
            $ref: '#/components/schemas/organizationInitial',
          },
          {
            type: 'object',
            properties: {
              verified: {
                type: 'boolean',
                description: 'Indication account is verified',
                example: true,
              },
              active: {
                type: 'boolean',
                description: 'Indication account is active',
                example: true,
              },
            },
            required: ['verified', 'active'],
          },
        ],
      },
      organizationCreate: {
        description: 'Organization creation details',
        type: 'object',
        properties: {
          organization: {
            $ref: '#/components/schemas/organizationInitial',
          },
          accounts: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/accountInitial',
            },
          },
        },
        required: ['organization'],
      },
      organizationUpdate: {
        description: 'Update organization details',
        type: 'object',
        properties: {
          picture: {
            type: 'string',
            description: 'Profile picture of organization',
          },
          verified: {
            type: 'boolean',
            description: 'Indication organization is verified',
          },
          active: {
            type: 'boolean',
            description: 'Indication organization is active',
          },
        },
      },
      accountResult: {
        description: 'Account result details',
        type: 'object',
        properties: {
          accountId: {
            $ref: '#/components/schemas/accountId',
          },
        },
        required: ['accountId'],
      },
      authResult: {
        description: 'Authentication result details',
        type: 'object',
        properties: {
          token: {
            $ref: '#/components/schemas/authToken',
          },
        },
        required: ['token'],
      },
      organizationResult: {
        description: 'Organization result details',
        type: 'object',
        properties: {
          organizationId: {
            $ref: '#/components/schemas/organizationId',
          },
        },
        required: ['organizationId'],
      },
      certificateInitial: {
        description: 'Initial certificate details',
        type: 'object',
        properties: {
          organization: {
            $ref: '#/components/schemas/assignedOrganization',
          },
          sampleId: {
            type: 'string',
            description: 'Identification of sample',
          },
          lotNumber: {
            type: 'string',
            description: 'Identification (number) of lot',
          },
          product: {
            type: 'string',
            description: 'Name of certified product',
          },
          category: {
            type: 'string',
            enum: ['Food', 'Product Testing', 'Other'],
            description: 'Product category',

            default: 'Food',
          },
          requestedBy: {
            $ref: '#/components/schemas/assignedAccount',
          },
        },
        required: [
          'organization',
          'sampleId',
          'product',
          'category',
          'requestedBy',
        ],
      },
      certificate: {
        description: 'Certificate details',
        type: 'object',
        allOf: [
          {
            type: 'object',
            properties: {
              certificateId: {
                $ref: '#/components/schemas/certificateId',
              },
            },
            required: ['certificateId'],
          },
          {
            $ref: '#/components/schemas/certificateInitial',
          },
        ],
      },
      certificateHistory: {
        description: 'Certificate history details',
        type: 'object',
        properties: {
          signers: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Name of signer',
                },
                email: {
                  type: 'string',
                  format: 'email',
                  description: 'Emailaddress of signer',
                },
                organization: {
                  type: 'string',
                  description: 'Organization the signer belongs to',
                },
                signedOn: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Date and time of signing certificate',
                },
              },
              required: ['name', 'email', 'organization', 'signedOn'],
            },
          },
          transactions: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              properties: {
                transactionId: {
                  type: 'string',
                  description: 'Id of transaction (blockchain txID)',
                  example:
                    'fa0f757bc278fdf6a32d00975602eb853e23a86a156781588d99ddef5b80720f',
                },
                title: {
                  type: 'string',
                  description: 'Title of recorded transaction',
                },
                description: {
                  type: 'string',
                  description: 'Description of recorded transaction',
                  example:
                    'Certificate with sampleId SA11098762 registered on 2021-12-21 at 07:14:11',
                },
              },
              required: ['transactionId', 'title', 'description'],
            },
          },
        },
      },
      certificateResult: {
        description: 'Certificate result details',
        type: 'object',
        properties: {
          certificateId: {
            $ref: '#/components/schemas/certificateId',
          },
        },
        required: ['certificateId'],
      },
      codeRequest: {
        description: 'Request for new authorization code',
        oneOf: [
          {
            type: 'object',
            properties: {
              emailAddress: {
                type: 'string',
                format: 'email',
                description: 'Email address of account',
              },
            },
            required: ['emailAddress'],
          },
          {
            type: 'object',
            properties: {
              phoneNumber: {
                type: 'string',
                pattern:
                  '^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$',
                description: 'Phone number of account',
              },
            },
            required: ['phoneNumber'],
          },
        ],
        'x-examples': {
          emailAddress: {
            emailAddress: 'robert.muster@henkel.de',
          },
          phoneNumber: {
            phoneNumber: '+494052601100',
          },
        },
      },
      document: {
        description: 'Document details',
        type: 'object',
        allOf: [
          {
            type: 'object',
            properties: {
              documentId: {
                $ref: '#/components/schemas/documentId',
              },
            },
            required: ['documentId'],
          },
          {
            $ref: '#/components/schemas/documentInitial',
          },
        ],
      },
      documentInitial: {
        description: 'Inital document details',
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Name of document',
          },
          fileContent: {
            type: 'string',
            format: 'binary',
            description:
              'Content/preview of uploaded file (required on post operation)',
            example:
              'JVBERi0xLjYNJeLjz9MNCjI0IDAgb2JqDTw8L0ZpbHRlci9GbGF0ZURlY29kZS9GaXJzdCA0L0xlbmd0aCAyMTYvTiAxL1R5cGUvT2JqU3RtPj5zdHJlYW0NCmjePI9RS8MwFIX/yn1bi9jepCQ6GYNpFBTEMsW97CVLbjWYNpImmz/fVsXXcw/f/c4SEFarepPTe4iFok8dU09DgtDBQx6TMwT74vaLTE7uSPDUdXM0Xe/73r1FnVwYYEtHR6d9WdY3kX4ipRMV6oojSmxQMoGyac5RLBAXf63p38aGA7XPorLewyvFcYaJile8rB+D/YcwiRdMMGScszO8/IW0MdhsaKKYGA46gXKTr/cUQVY4We/cYMNpnLVeXPJUXHs9fECr7kAFk+eZ5Xr9LcAAfKpQrA0KZW5kc3RyZWFtDWVuZG9iag0yNSAwIG9iag08PC9GaWx0ZXIvRmxhdGVEZWNvZGUvRmlyc3QgNC9MZW5ndGggNDkvTiAxL1R5cGUvT2JqU3RtPj5zdHJlYW0NCmjeslAwULCx0XfOL80rUTDU985MKY42NAIKBsXqh1QWpOoHJKanFtvZAQQYAN/6C60NCmVuZHN0cmVhbQ1lbmRvYmoNMjYgMCBvYmoNPDwvRmlsdGVyL0ZsYXRlRGVjb2RlL0ZpcnN0IDkvTGVuZ3RoIDQyL04gMi9UeXBlL09ialN0bT4+c3RyZWFtDQpo3jJTMFAwVzC0ULCx0fcrzS2OBnENFIJi7eyAIsH6LnZ2AAEGAI2FCDcNCmVuZHN0cmVhbQ1lbmRvYmoNMjcgMCBvYmoNPDwvRmlsdGVyL0ZsYXRlRGVjb2RlL0ZpcnN0IDUvTGVuZ3RoIDEyMC9OIDEvVHlwZS9PYmpTdG0+PnN0cmVhbQ0KaN4yNFIwULCx0XfOzytJzSspVjAyBgoE6TsX5Rc45VdEGwB5ZoZGCuaWRrH6vqkpmYkYogGJRUCdChZgfUGpxfmlRcmpxUAzA4ryk4NTS6L1A1zc9ENSK0pi7ez0g/JLEktSFQz0QyoLUoF601Pt7AACDADYoCeWDQplbmRzdHJlYW0NZW5kb2JqDTIgMCBvYmoNPDwvTGVuZ3RoIDM1MjUvU3VidHlwZS9YTUwvVHlwZS9NZXRhZGF0YT4+c3RyZWFtDQo8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/Pgo8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjQtYzAwNSA3OC4xNDczMjYsIDIwMTIvMDgvMjMtMTM6MDM6MDMgICAgICAgICI+CiAgIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgICAgIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAgICAgICAgICAgIHhtbG5zOnBkZj0iaHR0cDovL25zLmFkb2JlLmNvbS9wZGYvMS4zLyIKICAgICAgICAgICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICAgICAgICAgICB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIKICAgICAgICAgICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIj4KICAgICAgICAgPHBkZjpQcm9kdWNlcj5BY3JvYmF0IERpc3RpbGxlciA2LjAgKFdpbmRvd3MpPC9wZGY6UHJvZHVjZXI+CiAgICAgICAgIDx4bXA6Q3JlYXRlRGF0ZT4yMDA2LTAzLTA2VDE1OjA2OjMzLTA1OjAwPC94bXA6Q3JlYXRlRGF0ZT4KICAgICAgICAgPHhtcDpDcmVhdG9yVG9vbD5BZG9iZVBTNS5kbGwgVmVyc2lvbiA1LjIuMjwveG1wOkNyZWF0b3JUb29sPgogICAgICAgICA8eG1wOk1vZGlmeURhdGU+MjAxNi0wNy0xNVQxMDoxMjoyMSswODowMDwveG1wOk1vZGlmeURhdGU+CiAgICAgICAgIDx4bXA6TWV0YWRhdGFEYXRlPjIwMTYtMDctMTVUMTA6MTI6MjErMDg6MDA8L3htcDpNZXRhZGF0YURhdGU+CiAgICAgICAgIDx4bXBNTTpEb2N1bWVudElEPnV1aWQ6ZmYzZGNmZDEtMjNmYS00NzZmLTgzOWEtM2U1Y2FlMmRhMmViPC94bXBNTTpEb2N1bWVudElEPgogICAgICAgICA8eG1wTU06SW5zdGFuY2VJRD51dWlkOjM1OTM1MGIzLWFmNDAtNGQ4YS05ZDZjLTAzMTg2YjRmZmIzNjwveG1wTU06SW5zdGFuY2VJRD4KICAgICAgICAgPGRjOmZvcm1hdD5hcHBsaWNhdGlvbi9wZGY8L2RjOmZvcm1hdD4KICAgICAgICAgPGRjOnRpdGxlPgogICAgICAgICAgICA8cmRmOkFsdD4KICAgICAgICAgICAgICAgPHJkZjpsaSB4bWw6bGFuZz0ieC1kZWZhdWx0Ij5CbGFuayBQREYgRG9jdW1lbnQ8L3JkZjpsaT4KICAgICAgICAgICAgPC9yZGY6QWx0PgogICAgICAgICA8L2RjOnRpdGxlPgogICAgICAgICA8ZGM6Y3JlYXRvcj4KICAgICAgICAgICAgPHJkZjpTZXE+CiAgICAgICAgICAgICAgIDxyZGY6bGk+RGVwYXJ0bWVudCBvZiBKdXN0aWNlIChFeGVjdXRpdmUgT2ZmaWNlIG9mIEltbWlncmF0aW9uIFJldmlldyk8L3JkZjpsaT4KICAgICAgICAgICAgPC9yZGY6U2VxPgogICAgICAgICA8L2RjOmNyZWF0b3I+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgCjw/eHBhY2tldCBlbmQ9InciPz4NCmVuZHN0cmVhbQ1lbmRvYmoNMTEgMCBvYmoNPDwvTWV0YWRhdGEgMiAwIFIvUGFnZUxhYmVscyA2IDAgUi9QYWdlcyA4IDAgUi9UeXBlL0NhdGFsb2c+Pg1lbmRvYmoNMjMgMCBvYmoNPDwvRmlsdGVyL0ZsYXRlRGVjb2RlL0xlbmd0aCAxMD4+c3RyZWFtDQpIiQIIMAAAAAABDQplbmRzdHJlYW0NZW5kb2JqDTI4IDAgb2JqDTw8L0RlY29kZVBhcm1zPDwvQ29sdW1ucyA0L1ByZWRpY3RvciAxMj4+L0ZpbHRlci9GbGF0ZURlY29kZS9JRFs8REI3Nzc1Q0NFMjI3RjZCMzBDNDQwREY0MjIxREMzOTA+PEJGQ0NDRjNGNTdGNjEzNEFCRDNDMDRBOUU0Q0ExMDZFPl0vSW5mbyA5IDAgUi9MZW5ndGggODAvUm9vdCAxMSAwIFIvU2l6ZSAyOS9UeXBlL1hSZWYvV1sxIDIgMV0+PnN0cmVhbQ0KaN5iYgACJjDByGzIwPT/73koF0wwMUiBWYxA4v9/EMHA9I/hBVCxoDOQeH8DxH2KrIMIglFwIpD1vh5IMJqBxPpArHYgwd/KABBgAP8bEC0NCmVuZHN0cmVhbQ1lbmRvYmoNc3RhcnR4cmVmDQo0NTc2DQolJUVPRg0K',
          },
          reportId: {
            type: 'string',
            description: 'Id of report',
          },
          status: {
            type: 'string',
            enum: ['sent', 'signed', 'revoked'],
            default: 'sent',
          },
          requestedAt: {
            type: 'string',
            format: 'date-time',
            description:
              'Certificate requested at ISO datetime (default sysdate)',
          },
          validUntil: {
            type: 'string',
            format: 'date-time',
            description:
              'Certificate valid until ISO datetime (default 3 months)',
          },
        },
        required: ['name', 'reportId', 'status'],
      },
      documentResult: {
        description: 'Document result details',
        type: 'object',
        properties: {
          documentId: {
            $ref: '#/components/schemas/documentId',
          },
        },
        required: ['documentId'],
      },
      signer: {
        description: 'Signer details',
        type: 'object',
        properties: {
          accountId: {
            $ref: '#/components/schemas/accountId',
          },
          name: {
            type: 'string',
            description: 'Name of account / user / signer',
          },
          emailAddress: {
            type: 'string',
            format: 'email',
            description: 'Email address of signer',
          },
        },
        required: ['name', 'emailAddress'],
      },
      signers: {
        description: 'List of signers',
        type: 'array',
        minItems: 1,
        items: {
          $ref: '#/components/schemas/signer',
        },
        example: [
          {
            name: 'Max Muster',
            accountId: '1d94fca7b9ea021f3e3fe08933241d137e7201fe',
            emailAddress: 'max.muster@galab.de',
          },
          {
            name: 'Robert Munster',
            accountId: '241d137e7201fe1d94fca7b9ea021f3e3fe08933',
            emailAddress: 'robert.muster@henkel.de',
          },
        ],
      },
      signature: {
        description: 'Device signature object structure used in header',
        type: 'object',
        properties: {
          uniqueId: {
            type: 'string',
            description: 'Unique id of device',
          },
          userAgent: {
            type: 'string',
            description: 'User agent of browser',
            example:
              'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143',
          },
          ipAddress: {
            type: 'string',
            format: 'ipv4',
            description: 'IP Address of device',
          },
        },
        required: ['uniqueId', 'userAgent', 'ipAddress'],
      },
      statistics: {
        description: 'Statistics details',
        type: 'object',
        properties: {
          certificates: {
            $ref: '#/components/schemas/statsCertificate',
          },
          organizations: {
            $ref: '#/components/schemas/statsOrganization',
          },
        },
      },
      statsCertificate: {
        description: 'Certificate statistics',
        type: 'object',
        properties: {
          scanned: {
            type: 'integer',
            description: 'Amount of scanned certificates',
            example: 3410,
          },
          requested: {
            type: 'integer',
            description: 'Amount of requested certificates',
            example: 303,
          },
          categories: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/statsCategory',
            },
            example: [
              {
                name: 'Food',
                percentage: 56,
              },
              {
                name: 'Product Testing',
                percentage: 44,
              },
            ],
          },
        },
        required: ['scanned', 'requested'],
      },
      statsOrganization: {
        description: 'Organization statistics',
        type: 'object',
        properties: {
          totalUsers: {
            type: 'integer',
            description: 'Total amount of users',
            example: 20,
          },
          locations: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/statsLocation',
            },
            example: [
              {
                activeUsers: 4,
                city: 'Amsterdam',
                country: 'Netherlands',
              },
              {
                activeUsers: 10,
                city: 'Hamburg',
                country: 'Germany',
              },
              {
                activeUsers: 6,
                city: 'Paris',
                country: 'France',
              },
            ],
          },
        },
        required: ['totalUsers'],
      },
      statsCategory: {
        description: 'Category statistics',
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Name of category',
          },
          percentage: {
            type: 'integer',
            description: 'Percentage of certificates',
            example: 100,
          },
        },
        'x-examples': {},
      },
      statsLocation: {
        description: 'Location statistics',
        type: 'object',
        properties: {
          activeUsers: {
            type: 'integer',
            description: 'Amount of active users',
            example: 10,
          },
          city: {
            type: 'string',
            description: 'Name of the city',
          },
          country: {
            type: 'string',
            description: 'Name of the country',
          },
        },
        required: ['activeUsers', 'city', 'country'],
      },
      pageLinks: {
        description: 'Links object for pagination of results',
        type: 'object',
        properties: {
          self: {
            type: 'string',
            description: 'URI for retrieving current page',

            minLength: 1,
          },
          first: {
            type: 'string',
            description: 'URI for retrieving first page',

            minLength: 1,
          },
          prev: {
            type: 'string',
            description: 'URI for retrieving prev page',

            minLength: 1,
          },
          next: {
            type: 'string',
            description: 'URI for retrieving next page',

            minLength: 1,
          },
          last: {
            type: 'string',
            description: 'URI for retrieving last page',

            minLength: 1,
          },
        },
        required: ['self', 'first', 'last'],
      },
      accountId: {
        type: 'string',
        description: 'ID of account',
      },
      authToken: {
        type: 'string',
        description: 'Authorization token',
        example:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJUcmFjaWZpZXIiLCJzdWIiOiIzYjBiMWM5OTU5MjA5MTFkYjUxZWE1NjUxZjMyMTU3NzUxOGUxMDQxIiwiZGV2IjoiMjVkYWM1ZTNkMDgwNWYzNzQxNjQ4NWJlZmFmNDYxNzIiLCJpYXQiOjE1ODk3MjQ0NjcsImV4cCI6MTYwNTQ0OTI2N30.V_snE6gxU6767TNs15b_k-LTUr0V40I0mpa4BkFlKIw',
      },
      organizationId: {
        type: 'string',
        pattern: '^[a-f0-9]{40}$',
        description: 'ID of organization',
      },
      certificateId: {
        type: 'string',
        pattern: '^[a-f0-9]{40}$',
        description: 'ID of certificate',
      },
      commentId: {
        type: 'string',
        pattern: '^[a-f0-9]{40}$',
        description: 'ID of comment',
      },
      documentId: {
        type: 'string',
        pattern: '^[a-f0-9]{40}$',
        description: 'ID of document',
      },
      userRole: {
        type: 'string',
        description: 'User role enumation',
        enum: ['internal', 'admin', 'user', 'signer', 'verifier'],
        default: 'verifier',
      },
    },
    securitySchemes: {
      apiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-Tracifier-Client-Auth',
        description: 'API key of client application',
      },
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Authorization token',
      },
    },
  },
  paths: {},
})
export class OrganizationManagementController {
  constructor(
    @inject(OrganizationServiceBindings.ORGANIZATION_SERVICE)
    public organizationService: OrganizationService,
    @inject(NotificationServiceBindings.NOTIFICATION_SERVICE)
    public notificationService: NotificationService,
    @inject(SessionServiceBindings.SESSION_SERVICE)
    public sessionService: SessionService,
  ) {}

  /**
   * Provides registration capability for creating a new organization and optional
user accounts to access the organization-facing application.
   *
   * @param _requestBody Create a new organization
   * @returns Successful organization creation
   */
  @operation('post', '/organization-mgmt/organizations', {
    tags: ['Organization Management'],
    summary: 'Register new organization',
    description:
      'Provides registration capability for creating a new organization and optional user accounts to access the organization-facing application.',
    operationId: 'create-organization',
    security: [
      {
        apiKeyAuth: [],
      },
    ],
    requestBody: {
      $ref: '#/components/requestBodies/createOrganizationRequest',
    },
    responses: {
      '201': {
        $ref: '#/components/responses/createOrganizationResponse',
      },
      '401': {
        $ref: '#/components/responses/unauthorizedError',
      },
      '403': {
        $ref: '#/components/responses/forbiddenError',
      },
      '422': {
        $ref: '#/components/responses/unprocessableEntityError',
      },
      default: {
        $ref: '#/components/responses/internalServerError',
      },
    },
  })
  @authenticate('jwt')
  async createOrganization(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: UserProfile,
    @requestBody({
      description: 'Create a new organization',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/organizationCreate',
          },
        },
      },
    })
    _requestBody: OrganizationCreate,
  ): Promise<OrganizationResult> {
    // Check if session exist and is valid
    await this.sessionService.checkSession(currentUser);

    // Check internal permissions
    await this.sessionService.checkInternalPermissions(currentUser);

    // Create new organization
    const organizationId = await this.organizationService.newOrganization(
      _requestBody.organization,
    );

    // Create organization accounts
    for (const account of _requestBody.accounts) {
      try {
        const accountId = await this.organizationService.newOrganizationAccount(
          organizationId,
          account,
        );
        console.info(
          `Account processed for '${account.emailAddress}' with ID ${accountId}`,
        );
        // Send invitation email
        await this.notificationService.sendInvitationEmail(
          account.emailAddress,
          _requestBody.organization.name,
        );
      } catch (error) {
        Sentry.captureException(
          `Error occured during processing of initial organization account'. ${error}`,
        );
      }
    }

    return new OrganizationResult({
      organizationId: organizationId,
    });
  }

  /**
   * Provides retrieval capability for returning list of organizations that belongs
to the current API user based on the value of the authorization header
   *
   * @param offset The number of items to skip before starting to collect the
result set.
   * @param limit The number of items to return.
   * @param sort The fields to sort result by using format: `operator:fieldname`.
Separate multiple sort fields by a comma.
|operator|Purpose|
|--------|-------|
|asc|Ascending|
|desc|Descending|
   * @param filter The fields to filter result on using format:
`fieldname:operator:value`.
Separate multiple fiters by a comma.
|operator|Purpose|
|--------|-------|
|eq|Field value equals given value|
|gt|Field value greater then given value|
|lt|Field value lesser then given value|
|gte|Field value greater then / equals given value|
|lte|Field value lesser then / equals given value|
   * @returns List of organizations
   */
  @operation('get', '/organization-mgmt/organizations', {
    tags: ['Organization Management'],
    summary: 'Retrieve list of organizations',
    description:
      'Provides retrieval capability for returning list of organizations that belongs to the current API user based on the value of the authorization header',
    operationId: 'get-organizations',
    security: [
      {
        apiKeyAuth: [],
      },
      {
        bearerAuth: [],
      },
    ],
    parameters: [
      {
        $ref: '#/components/parameters/offsetParam',
      },
      {
        $ref: '#/components/parameters/limitParam',
      },
      {
        $ref: '#/components/parameters/sortByParam',
      },
      {
        $ref: '#/components/parameters/filterOnParam',
      },
    ],
    responses: {
      '200': {
        $ref: '#/components/responses/getOrganizationsResponse',
      },
      '401': {
        $ref: '#/components/responses/unauthorizedError',
      },
      '403': {
        $ref: '#/components/responses/forbiddenError',
      },
      '422': {
        $ref: '#/components/responses/unprocessableEntityError',
      },
      default: {
        $ref: '#/components/responses/internalServerError',
      },
    },
  })
  @authenticate('jwt')
  async getOrganizations(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: UserProfile,
    @param({
      name: 'offset',
      in: 'query',
      schema: {
        type: 'integer',
        minimum: 0,
        default: 0,
      },
      required: false,
      description:
        'The number of items to skip before starting to collect the result set.',
    })
    offset: number | undefined,
    @param({
      name: 'limit',
      in: 'query',
      schema: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        default: 20,
      },
      required: false,
      description: 'The number of items to return.',
    })
    limit: number | undefined,
    @param({
      name: 'sort',
      in: 'query',
      explode: false,
      schema: {
        type: 'string',
        pattern: '^(?:desc|asc):[a-zA-Z]+$',
      },
      description:
        'The fields to sort result by using format: `operator:fieldname`.\nSeparate multiple sort fields by a comma.\n|operator|Purpose|\n|--------|-------|\n|asc|Ascending|\n|desc|Descending|',
    })
    sort: string | undefined,
    @param({
      name: 'filter',
      in: 'query',
      explode: false,
      schema: {
        type: 'string',
        pattern:
          '^([,]?[a-zA-Z]+:(?:eq|gt|gte|lt|lte|like|ilike):[a-zA-ZÀ-ž0-9-:.]+)*$',
      },
      description:
        'The fields to filter result on using format: `fieldname:operator:value`. \nSeparate multiple fiters by a comma.\n|operator|Purpose|\n|--------|-------|\n|eq|Field value equals given value|\n|gt|Field value greater then given value|\n|lt|Field value lesser then given value|\n|gte|Field value greater then / equals given value|\n|lte|Field value lesser then / equals given value|',
    })
    filter: string | undefined,
  ): Promise<{
    _links: PageLinks;
    count: number;
    total: number;
    organizations?: (Organization & {
      amountOfCertificates?: number;
    })[];
  }> {
    // Check if session exist and is valid
    await this.sessionService.checkSession(currentUser);

    // Check internal permissions
    await this.sessionService.checkInternalPermissions(currentUser);

    // Get list of organizations
    const organizations = await this.organizationService.getOrganizations(
      filter,
      sort,
      limit,
      offset,
    );

    // Get total, count and generate links
    const total = await this.organizationService.countOrganizations(filter);
    const count = organizations.length;
    const links: PageLinks = determineLinks({
      base: '/organization-mgmt/organizations',
      total: total,
      filter: filter,
      sort: sort,
      limit: limit,
      offset: offset,
    });

    // return result
    return {
      _links: links,
      count: count,
      total: total,
      organizations: organizations,
    };
  }

  /**
   * Provides retrieval capabitlity for returning a specific organization. API user
needs to be an internal admin or a member of the requested organization.
   *
   * @param organizationId Id of the organization
   * @returns Organization details
   */
  @operation('get', '/organization-mgmt/organizations/{organizationId}', {
    tags: ['Organization Management'],
    summary: 'Retrieve organization details',
    description:
      'Provides retrieval capabitlity for returning a specific organization. API user needs to be an internal admin or a member of the requested organization.',
    operationId: 'get-organization',
    security: [
      {
        apiKeyAuth: [],
      },
      {
        bearerAuth: [],
      },
    ],
    parameters: [
      {
        $ref: '#/components/parameters/organizationIdParam',
      },
    ],
    responses: {
      '200': {
        $ref: '#/components/responses/getOrganizationResponse',
      },
      '400': {
        $ref: '#/components/responses/badRequestError',
      },
      '401': {
        $ref: '#/components/responses/unauthorizedError',
      },
      '403': {
        $ref: '#/components/responses/forbiddenError',
      },
      '422': {
        $ref: '#/components/responses/unprocessableEntityError',
      },
      default: {
        $ref: '#/components/responses/internalServerError',
      },
    },
  })
  @authenticate('jwt')
  async getOrganization(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: UserProfile,
    @param({
      name: 'organizationId',
      in: 'path',
      required: true,
      schema: {
        $ref: '#/components/schemas/organizationId',
      },
      description: 'Id of the organization',
    })
    organizationId: OrganizationId,
  ): Promise<
    Organization & {
      accounts?: Account[];
    }
  > {
    // Call SessionService.checkSession to check if session exist;
    await this.sessionService.checkSession(currentUser);

    // Call OrganizationService.getOrganization(sess.accountId)
    const organization: Organization =
      await this.organizationService.getOrganization(organizationId);

    const accounts: Account[] =
      await this.organizationService.getOrganizationAccounts(organizationId);

    const result: Organization & {
      accounts?: Account[];
    } = {...organization, accounts: accounts};

    console.log('====================================',result)

    return result;
  }

  /**
   * Provide update capability for changing organization details. API user needs to
be an internal admin or an admin member of the requested organization.
   *
   * @param organizationId Id of the organization
   * @param _requestBody Update an existing organization
   */
  @operation('put', '/organization-mgmt/organizations/{organizationId}', {
    tags: ['Organization Management'],
    summary: 'Update organization details',
    description:
      'Provide update capability for changing organization details. API user needs to be an  internal admin or an admin member of the requested organization.',
    operationId: 'update-organization',
    security: [
      {
        apiKeyAuth: [],
      },
      {
        bearerAuth: [],
      },
    ],
    parameters: [
      {
        $ref: '#/components/parameters/organizationIdParam',
      },
    ],
    requestBody: {
      $ref: '#/components/requestBodies/updateOrganizationRequest',
    },
    responses: {
      '204': {
        description: 'Successfully updated organization details',
      },
      '401': {
        $ref: '#/components/responses/unauthorizedError',
      },
      '403': {
        $ref: '#/components/responses/forbiddenError',
      },
      '404': {
        $ref: '#/components/responses/notFoundError',
      },
      '422': {
        $ref: '#/components/responses/unprocessableEntityError',
      },
      default: {
        $ref: '#/components/responses/internalServerError',
      },
    },
  })
  @authenticate('jwt')
  async updateOrganization(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: UserProfile,
    @param({
      name: 'organizationId',
      in: 'path',
      required: true,
      schema: {
        $ref: '#/components/schemas/organizationId',
      },
      description: 'Id of the organization',
    })
    organizationId: OrganizationId,
    @requestBody({
      description: 'Update an existing organization',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/organizationInitial',
          },
        },
      },
    })
    _requestBody: OrganizationInitial,
  ): Promise<unknown> {
    // Check if session exist and is valid
    await this.sessionService.checkSession(currentUser);

    // Check if you are allowed to update organization
    await this.sessionService.checkOrganizationPermissions(
      currentUser,
      organizationId,
    );

    // Update organization details
    await this.organizationService.updateOrganization(
      organizationId,
      _requestBody,
    );

    return;
  }

  /**
   * Provide update capability for changing profile picture and active status.
API user needs to be an internal admin or an admin member of the requested
organization.
   *
   * @param organizationId Id of the organization
   * @param _requestBody Patch organization details
   */
  @operation('patch', '/organization-mgmt/organizations/{organizationId}', {
    tags: ['Organization Management'],
    summary: 'Update organization profile',
    description:
      'Provide update capability for changing profile picture and active status. API user needs to be an internal admin or an admin member of the requested organization.',
    operationId: 'patch-organization',
    security: [
      {
        apiKeyAuth: [],
      },
      {
        bearerAuth: [],
      },
    ],
    parameters: [
      {
        $ref: '#/components/parameters/organizationIdParam',
      },
    ],
    requestBody: {
      $ref: '#/components/requestBodies/patchOrganizationRequest',
    },
    responses: {
      '204': {
        description: 'Successfully updated organization details',
      },
      '401': {
        $ref: '#/components/responses/unauthorizedError',
      },
      '403': {
        $ref: '#/components/responses/forbiddenError',
      },
      '404': {
        $ref: '#/components/responses/notFoundError',
      },
      '422': {
        $ref: '#/components/responses/unprocessableEntityError',
      },
      default: {
        $ref: '#/components/responses/internalServerError',
      },
    },
  })
  @authenticate('jwt')
  async patchOrganization(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: UserProfile,
    @param({
      name: 'organizationId',
      in: 'path',
      required: true,
      schema: {
        $ref: '#/components/schemas/organizationId',
      },
      description: 'Id of the organization',
    })
    organizationId: OrganizationId,
    @requestBody({
      description: 'Patch organization details',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/organizationUpdate',
          },
        },
      },
    })
    _requestBody: OrganizationUpdate,
  ): Promise<unknown> {
    // Check if session exist and is valid
    await this.sessionService.checkSession(currentUser);

    // Check if you are allowed to update organization
    // await this.sessionService.checkOrganizationPermissions(
    //   currentUser,
    //   organizationId,
    // );

    // Update organization details
    await this.organizationService.updateOrganization(
      organizationId,
      {
        picture: _requestBody.picture,
        active: _requestBody.active,
        verified: _requestBody.verified,
      },
      false,
    );

    return;
  }

  /**
   * Provides removal capability of organization and associated accounts. This is
only possible when organization does not have any certificates assinged to it,
else disable organization only possible.
   *
   * @param organizationId Id of the organization
   */
  @operation('delete', '/organization-mgmt/organizations/{organizationId}', {
    tags: ['Organization Management'],
    summary: 'Remove all organization data',
    description:
      'Provides removal capability of organization and associated accounts. This is only possible when organization does not have any certificates assinged to it, else disable organization only possible.',
    operationId: 'delete-organization',
    security: [
      {
        apiKeyAuth: [],
      },
      {
        bearerAuth: [],
      },
    ],
    parameters: [
      {
        $ref: '#/components/parameters/organizationIdParam',
      },
    ],
    responses: {
      '204': {
        description: 'Successful organization removal',
      },
      '400': {
        $ref: '#/components/responses/badRequestError',
      },
      '401': {
        $ref: '#/components/responses/unauthorizedError',
      },
      '403': {
        $ref: '#/components/responses/forbiddenError',
      },
      '404': {
        $ref: '#/components/responses/notFoundError',
      },
      '422': {
        $ref: '#/components/responses/unprocessableEntityError',
      },
      default: {
        $ref: '#/components/responses/internalServerError',
      },
    },
  })
  @authenticate('jwt')
  async deleteOrganization(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: UserProfile,
    @param({
      name: 'organizationId',
      in: 'path',
      required: true,
      schema: {
        $ref: '#/components/schemas/organizationId',
      },
      description: 'Id of the organization',
    })
    organizationId: OrganizationId,
  ): Promise<unknown> {
    // Check if session exist and is valid
    await this.sessionService.checkSession(currentUser);

    // Check if you are allowed to update organization
    await this.sessionService.checkOrganizationPermissions(
      currentUser,
      organizationId,
    );

    // Delete the organization
    await this.organizationService.deleteOrganization(organizationId);

    return;
  }

  /**
   * Provides registration capability for adding user accounts to organizations to
access the organization-facing application.
   *
   * @param organizationId Id of the organization
   * @param _requestBody Add a new account
   * @returns Successful account creation
   */
  @operation(
    'post',
    '/organization-mgmt/organizations/{organizationId}/accounts',
    {
      tags: ['Organization Management'],
      summary: 'Add account to existing organization',
      description:
        'Provides registration capability for adding user accounts to organizations to access the organization-facing application.',
      operationId: 'add-organization-account',
      security: [
        {
          apiKeyAuth: [],
        },
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          $ref: '#/components/parameters/organizationIdParam',
        },
      ],
      requestBody: {
        $ref: '#/components/requestBodies/createAccountRequest',
      },
      responses: {
        '201': {
          $ref: '#/components/responses/createAccountResponse',
        },
        '400': {
          $ref: '#/components/responses/badRequestError',
        },
        '401': {
          $ref: '#/components/responses/unauthorizedError',
        },
        '403': {
          $ref: '#/components/responses/forbiddenError',
        },
        '404': {
          $ref: '#/components/responses/notFoundError',
        },
        '422': {
          $ref: '#/components/responses/unprocessableEntityError',
        },
        default: {
          $ref: '#/components/responses/internalServerError',
        },
      },
    },
  )
  @authenticate('jwt')
  async addOrganizationAccount(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: UserProfile,
    @param({
      name: 'organizationId',
      in: 'path',
      required: true,
      schema: {
        $ref: '#/components/schemas/organizationId',
      },
      description: 'Id of the organization',
    })
    organizationId: OrganizationId,
    @requestBody({
      description: 'Create a new account',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/accountInitial',
          },
        },
      },
    })
    _requestBody: AccountInitial,
  ): Promise<AccountResult> {
    // Check if session exist and is valid
    await this.sessionService.checkSession(currentUser);

    // Check if you are allowed to update organization
    await this.sessionService.checkOrganizationPermissions(
      currentUser,
      organizationId,
    );

    // Create new organization account
    const accountId = await this.organizationService.newOrganizationAccount(
      organizationId,
      _requestBody,
    );

    return {
      accountId: accountId,
    };
  }

  /**
   * Provides retrieval capability for returning list of organization accounts that
belongs to the current API user based on the value of the authorization
header
   *
   * @param organizationId Id of the organization
   * @param offset The number of items to skip before starting to collect the
result set.
   * @param limit The number of items to return.
   * @param sort The fields to sort result by using format: `operator:fieldname`.
Separate multiple sort fields by a comma.
|operator|Purpose|
|--------|-------|
|asc|Ascending|
|desc|Descending|
   * @param filter The fields to filter result on using format:
`fieldname:operator:value`.
Separate multiple fiters by a comma.
|operator|Purpose|
|--------|-------|
|eq|Field value equals given value|
|gt|Field value greater then given value|
|lt|Field value lesser then given value|
|gte|Field value greater then / equals given value|
|lte|Field value lesser then / equals given value|
   * @returns List of accounts
   */
  @operation(
    'get',
    '/organization-mgmt/organizations/{organizationId}/accounts',
    {
      tags: ['Organization Management'],
      summary: 'Retrieve list of organization accounts',
      description:
        'Provides retrieval capability for returning list of organization accounts that belongs to the current API user based on the value of the authorization header',
      operationId: 'get-organization-accounts',
      security: [
        {
          apiKeyAuth: [],
        },
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          $ref: '#/components/parameters/organizationIdParam',
        },
        {
          $ref: '#/components/parameters/offsetParam',
        },
        {
          $ref: '#/components/parameters/limitParam',
        },
        {
          $ref: '#/components/parameters/sortByParam',
        },
        {
          $ref: '#/components/parameters/filterOnParam',
        },
      ],
      responses: {
        '200': {
          $ref: '#/components/responses/getAccountsResponse',
        },
        '400': {
          $ref: '#/components/responses/badRequestError',
        },
        '401': {
          $ref: '#/components/responses/unauthorizedError',
        },
        '403': {
          $ref: '#/components/responses/forbiddenError',
        },
        '404': {
          $ref: '#/components/responses/notFoundError',
        },
        '422': {
          $ref: '#/components/responses/unprocessableEntityError',
        },
        default: {
          $ref: '#/components/responses/internalServerError',
        },
      },
    },
  )
  @authenticate('jwt')
  async getOrganizationAccounts(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: UserProfile,
    @param({
      name: 'organizationId',
      in: 'path',
      required: true,
      schema: {
        $ref: '#/components/schemas/organizationId',
      },
      description: 'Id of the organization',
    })
    organizationId: OrganizationId,
    @param({
      name: 'offset',
      in: 'query',
      schema: {
        type: 'integer',
        minimum: 0,
        default: 0,
      },
      required: false,
      description:
        'The number of items to skip before starting to collect the result set.',
    })
    offset: number | undefined,
    @param({
      name: 'limit',
      in: 'query',
      schema: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        default: 20,
      },
      required: false,
      description: 'The number of items to return.',
    })
    limit: number | undefined,
    @param({
      name: 'sort',
      in: 'query',
      explode: false,
      schema: {
        type: 'string',
        pattern: '^(?:desc|asc):[a-zA-Z]+$',
      },
      description:
        'The fields to sort result by using format: `operator:fieldname`.\nSeparate multiple sort fields by a comma.\n|operator|Purpose|\n|--------|-------|\n|asc|Ascending|\n|desc|Descending|',
    })
    sort: string | undefined,
    @param({
      name: 'filter',
      in: 'query',
      explode: false,
      schema: {
        type: 'string',
        pattern:
          '^([,]?[a-zA-Z]+:(?:eq|gt|gte|lt|lte|like|ilike):[a-zA-ZÀ-ž0-9-:.]+)*$',
      },
      description:
        'The fields to filter result on using format: `fieldname:operator:value`. \nSeparate multiple fiters by a comma.\n|operator|Purpose|\n|--------|-------|\n|eq|Field value equals given value|\n|gt|Field value greater then given value|\n|lt|Field value lesser then given value|\n|gte|Field value greater then / equals given value|\n|lte|Field value lesser then / equals given value|',
    })
    filter: string | undefined,
  ): Promise<{
    _links: PageLinks;
    count: number;
    total: number;
    organization?: string;
    accounts?: Account[];
  }> {
    // Check if session exist and is valid
    await this.sessionService.checkSession(currentUser);

    // Check if you are allowed to update organization
    await this.sessionService.checkOrganizationPermissions(
      currentUser,
      organizationId,
    );

    // Retrieve all organization accounts
    const accounts: Account[] =
      await this.organizationService.getOrganizationAccounts(organizationId);

    // Get total, count and generate links
    const total = await this.organizationService.countOrganizationAccounts(
      organizationId,
      filter,
    );
    const count = accounts.length;
    const links: PageLinks = determineLinks({
      base: `/organization-mgmt/organizations/${organizationId}/accounts`,
      total: total,
      filter: filter,
      sort: sort,
      limit: limit,
      offset: offset,
    });

    // return result
    return {
      _links: links,
      count: count,
      total: total,
      accounts: accounts,
    };
  }

  /**
   * Provide update capability for changing account details. API user needs to be
an internal admin or an admin member of the requested organization.
   *
   * @param organizationId Id of the organization
   * @param accountId Id of the account
   * @param _requestBody Update an existing account
   */
  @operation(
    'put',
    '/organization-mgmt/organizations/{organizationId}/accounts/{accountId}',
    {
      tags: ['Organization Management'],
      summary: 'Update organization account details',
      description:
        'Provide update capability for changing account details. API user needs to be an internal admin or an admin member of the requested organization.',
      operationId: 'update-account',
      security: [
        {
          apiKeyAuth: [],
        },
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          $ref: '#/components/parameters/organizationIdParam',
        },
        {
          $ref: '#/components/parameters/accountIdParam',
        },
      ],
      requestBody: {
        $ref: '#/components/requestBodies/updateAccountRequest',
      },
      responses: {
        '204': {
          description: 'Successfully updated account details',
        },
        '400': {
          $ref: '#/components/responses/badRequestError',
        },
        '401': {
          $ref: '#/components/responses/unauthorizedError',
        },
        '403': {
          $ref: '#/components/responses/forbiddenError',
        },
        '404': {
          $ref: '#/components/responses/notFoundError',
        },
        '422': {
          $ref: '#/components/responses/unprocessableEntityError',
        },
        default: {
          $ref: '#/components/responses/internalServerError',
        },
      },
    },
  )
  @authenticate('jwt')
  async updateAccount(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: UserProfile,
    @param({
      name: 'organizationId',
      in: 'path',
      required: true,
      schema: {
        $ref: '#/components/schemas/organizationId',
      },
      description: 'Id of the organization',
    })
    organizationId: OrganizationId,
    @param({
      name: 'accountId',
      in: 'path',
      required: true,
      schema: {
        $ref: '#/components/schemas/accountId',
      },
      description: 'Id of the account',
    })
    accountId: AccountId,
    @requestBody({
      description: 'Update an existing account',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/accountInitial',
          },
        },
      },
    })
    _requestBody: AccountInitial,
  ): Promise<unknown> {
    // Check if session exist and is valid
    await this.sessionService.checkSession(currentUser);

    // Check if you are allowed to update organization
    await this.sessionService.checkOrganizationPermissions(
      currentUser,
      organizationId,
    );

    // Update the account
    await this.organizationService.updateOrganizationAccount(
      organizationId,
      accountId,
      _requestBody,
    );

    return;
  }

  /**
   * Provide update capability for changing account verified and active status.
API user needs to be an internal admin or an admin member of the requested
organization.
   *
   * @param organizationId Id of the organization
   * @param accountId Id of the account
   * @param _requestBody Patch account details
   */
  @operation(
    'patch',
    '/organization-mgmt/organizations/{organizationId}/accounts/{accountId}',
    {
      tags: ['Organization Management'],
      summary: 'Update account status',
      description:
        'Provide update capability for changing account verified and active status. API user needs to be an internal admin or an admin member of the requested organization.',
      operationId: 'patch-account',
      security: [
        {
          apiKeyAuth: [],
        },
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          $ref: '#/components/parameters/organizationIdParam',
        },
        {
          $ref: '#/components/parameters/accountIdParam',
        },
      ],
      requestBody: {
        $ref: '#/components/requestBodies/patchAccountRequest',
      },
      responses: {
        '204': {
          description: 'Successfully updated account details',
        },
        '400': {
          $ref: '#/components/responses/badRequestError',
        },
        '401': {
          $ref: '#/components/responses/unauthorizedError',
        },
        '403': {
          $ref: '#/components/responses/forbiddenError',
        },
        '404': {
          $ref: '#/components/responses/notFoundError',
        },
        '422': {
          $ref: '#/components/responses/unprocessableEntityError',
        },
        default: {
          $ref: '#/components/responses/internalServerError',
        },
      },
    },
  )
  @authenticate('jwt')
  async patchAccount(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: UserProfile,
    @param({
      name: 'organizationId',
      in: 'path',
      required: true,
      schema: {
        $ref: '#/components/schemas/organizationId',
      },
      description: 'Id of the organization',
    })
    organizationId: OrganizationId,
    @param({
      name: 'accountId',
      in: 'path',
      required: true,
      schema: {
        $ref: '#/components/schemas/accountId',
      },
      description: 'Id of the account',
    })
    accountId: AccountId,
    @requestBody({
      description: 'Patch account details',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/accountUpdate',
          },
        },
      },
    })
    _requestBody: AccountUpdate,
  ): Promise<unknown> {
    // Check if session exist and is valid
    await this.sessionService.checkSession(currentUser);

    // Check if you are allowed to update organization
    await this.sessionService.checkOrganizationPermissions(
      currentUser,
      organizationId,
    );

    // Update the account
    await this.organizationService.updateOrganizationAccount(
      organizationId,
      accountId,
      {
        active: _requestBody.active,
        verified: _requestBody.verified,
      },
      false,
    );

    return;
  }

  /**
   * Provides removal capability of user accounts from organization and the access to
the organization-facing application.
   *
   * @param organizationId Id of the organization
   * @param accountId Id of the account
   */
  @operation(
    'delete',
    '/organization-mgmt/organizations/{organizationId}/accounts/{accountId}',
    {
      tags: ['Organization Management'],
      summary: 'Remove account from existing organization',
      description:
        'Provides removal capability of user accounts from organization and the access to the organization-facing application.',
      operationId: 'delete-organization-account',
      security: [
        {
          apiKeyAuth: [],
        },
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          $ref: '#/components/parameters/organizationIdParam',
        },
        {
          $ref: '#/components/parameters/accountIdParam',
        },
      ],
      responses: {
        '204': {
          description: 'Successful account removal',
        },
        '400': {
          $ref: '#/components/responses/badRequestError',
        },
        '401': {
          $ref: '#/components/responses/unauthorizedError',
        },
        '403': {
          $ref: '#/components/responses/forbiddenError',
        },
        '404': {
          $ref: '#/components/responses/notFoundError',
        },
        '422': {
          $ref: '#/components/responses/unprocessableEntityError',
        },
        default: {
          $ref: '#/components/responses/internalServerError',
        },
      },
    },
  )
  @authenticate('jwt')
  async deleteOrganizationAccount(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: UserProfile,
    @param({
      name: 'organizationId',
      in: 'path',
      required: true,
      schema: {
        $ref: '#/components/schemas/organizationId',
      },
      description: 'Id of the organization',
    })
    organizationId: OrganizationId,
    @param({
      name: 'accountId',
      in: 'path',
      required: true,
      schema: {
        $ref: '#/components/schemas/accountId',
      },
      description: 'Id of the account',
    })
    accountId: AccountId,
  ): Promise<unknown> {
    // Check if session exist and is valid
    await this.sessionService.checkSession(currentUser);

    // Check if you are allowed to update organization
    await this.sessionService.checkOrganizationPermissions(
      currentUser,
      organizationId,
    );

    // Remove account from organization
    await this.organizationService.deleteOrganizationAccount(
      organizationId,
      accountId,
    );

    return;
  }
}
