/* eslint-disable @typescript-eslint/naming-convention */
import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {api, operation} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {AppConstants, DataManagementServiceBindings, SessionServiceBindings, CertificateServiceBindings} from '../keys';
import {Statistics} from '../models/statistics.model';
import {DataManagementService, SessionService, CertificateService} from '../services/interfaces';
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: AppConstants.SENTRY_DSN,
  tracesSampleRate: AppConstants.SENTRY_RATE,
});

Sentry.setTags({
  'service-name':'data-management-service',
})

/**
 * The controller class is generated from OpenAPI spec with operations tagged
 * by Data management.
 *
 * Resources in this group are related to statistics and other
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
          },
        },
      },
      createOrganizationAccountRequest: {
        description: 'Create a new organization account',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/accountInitial',
            },
          },
        },
      },
      createAccountRequest: {
        description: 'Create a new account',
        content: {
          'application/json': {
            schema: {
              allOf: [
                {
                  $ref: '#/components/schemas/accountInitial',
                },
                {
                  type: 'object',
                  properties: {
                    organization: {
                      $ref: '#/components/schemas/organizationInfo',
                    },
                  },
                },
              ],
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
              $ref: '#/components/schemas/account',
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
              $ref: '#/components/schemas/organization',
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
                    },
                    amountOfSigner: {
                      description: 'The amount of cetificate signers',
                      type: 'integer',
                      format: 'int32',
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
            },
          },
        },
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/organizationResult',
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
                          },
                        },
                      },
                    ],
                  },
                },
              },
              required: ['_links', 'count', 'total'],
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
          pattern: '^[a-zA-Z]+:(?:eq|gt|gte|lt|lte):[a-zA-ZÀ-ž0-9-:.]+$',
        },
        description:
          'The fields to filter result on using format: `fieldname:operator:value`. \nSeparate multiple fiters by a comma.\n|operator|Purpose|\n|--------|-------|\n|eq|Field value equals given value|\n|gt|Field value greater then given value|\n|lt|Field value lesser then given value|\n|gte|Field value greater then / equals given value|\n|lte|Field value lesser then / equals given value|',
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
          name: {
            type: 'string',
            description: 'Name of account',
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
        required: ['name', 'emailAddress', 'userRole'],
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
            format: 'binary',
            description: 'Profile picture',
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
      organizationInfo: {
        description: 'Organization info details',
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Name of organization',
          },
          country: {
            type: 'string',
            description: 'Name of the country',
          },
        },
        required: ['name', 'country'],
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
            format: 'binary',
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
              enum: ['Food', 'Product Testing', 'Other'],
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
            format: 'binary',
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
                },
                title: {
                  type: 'string',
                  description: 'Title of recorded transaction',
                },
                description: {
                  type: 'string',
                  description: 'Description of recorded transaction',
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
        required: ['name', 'status'],
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
          accounts: {
            $ref: '#/components/schemas/statsOrganization',
          },
          documents: {
            $ref: '#/components/schemas/statsDocument',
          },
        },
      },
      statsDocument: {
        description: 'Document statistics',
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'name of document',
          },
          status: {
            type: 'string',
            description: 'Status of document',
          },
          signer: {
            type: 'string',
            description: 'Signer',
          },
          validUntil: {
            type: 'string',
            description: 'Expiry Date',
          },
        }
      },
      statsCertificate: {
        description: 'Certificate statistics',
        type: 'object',
        properties: {
          scanned: {
            type: 'integer',
            description: 'Amount of scanned certificates',
          },
          requested: {
            type: 'integer',
            description: 'Amount of requested certificates',
          },
          categories: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/statsCategory',
            },
          },
        },
        required: ['scanned', 'requested'],
      },
      statsOrganization: {
        description: 'Organization statistics',
        type: 'object',
        properties: {
          locations: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/statsLocation',
            },
          },
        },
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
          },
        },
      },
      statsLocation: {
        description: 'Location statistics',
        type: 'object',
        properties: {
          activeUsers: {
            type: 'integer',
            description: 'Amount of active users',
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
        enum: ['internal', 'admin', 'user', 'signer', 'reader'],
        default: 'reader',
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
export class DataManagementController {
  constructor(
    @inject(SessionServiceBindings.SESSION_SERVICE)
    public sessionService: SessionService,
    @inject(DataManagementServiceBindings.DATAMGMT_SERVICE)
    public dataManagementService: DataManagementService,
    @inject(CertificateServiceBindings.CERTIFICATE_SERVICE)
    public certificateService: CertificateService,
  ) {}

  /**
   * Retrieve statistics of the number of certificates and user accounts.
   *
   * @returns Successful authentication
   */
  @operation('get', '/data-mgmt/statistics', {
    tags: ['Data management'],
    summary:
      'Provides retrieval capability for returning statistics of certificates and user accounts.',
    description:
      'Retrieve statistics of the number of certificates and user accounts.',
    operationId: 'retrieve-statistics',
    security: [
      {
        apiKeyAuth: [],
      },
      {
        bearerAuth: [],
      },
    ],
    responses: {
      '200': {
        $ref: '#/components/responses/statisticsResponse',
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
  async retrieveStatistics(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: UserProfile,
  ): Promise<Statistics> {
    // Check if session exist and is valid
    await this.sessionService.checkSession(currentUser);
    // If user is not internal pass on accountId
    let accountId;
    // if (currentUser.role !== 'internal') {
      accountId = currentUser.accountId;
    // }
    const documents: any = await this.certificateService.getDocumentsFromAccount(accountId);
    return this.dataManagementService.retrieveStatistics(accountId, documents);
  }
}
