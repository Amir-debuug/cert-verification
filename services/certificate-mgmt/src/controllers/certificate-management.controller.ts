/* eslint-disable @typescript-eslint/naming-convention */
import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {api, operation, param, requestBody} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {
  AppConstants,
  CertificateServiceBindings,
  NotificationServiceBindings,
  SessionServiceBindings
} from '../keys';
import {AccountResult} from '../models/account-result.model';
import {CertificateHistory} from '../models/certificate-history.model';
import {CertificateId} from '../models/certificate-id.model';
import {CertificateInitial} from '../models/certificate-initial.model';
import {CertificateResult} from '../models/certificate-result.model';
import {Certificate} from '../models/certificate.model';
import {Comment} from '../models/comment.model';
import {DocumentId} from '../models/document-id.model';
import {DocumentInitial} from '../models/document-initial.model';
import {DocumentResult} from '../models/document-result.model';
import {Document} from '../models/document.model';
import {PageLinks} from '../models/page-links.model';
import {Signer} from '../models/signer.model';
import {Signers} from '../models/signers.model';
import {determineLinks} from '../services';
import {
  CertificateService,
  NotificationService,
  SessionService
} from '../services/interfaces';
import * as Sentry from '@sentry/node';
import { DocumentAccessPermissionEntity } from '../entities';

Sentry.init({
  dsn: AppConstants.SENTRY_DSN,
  tracesSampleRate: AppConstants.SENTRY_RATE,
});

Sentry.setTags({
  'service-name':'certificate-service',
})
/**
 * The controller class is generated from OpenAPI spec with operations tagged
 * by Certificate Management.
 * 
 * Resources in this group are related to certificate management.
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
      addDocumentAccessPermisionRequest: {
        description: 'Add a new access permission',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/accessPermission',
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
          'text/plain; charset=UTF-8': {
            schema: {
              type: 'string',
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
          pattern:
            '^([,]?[a-zA-Z.]+:(?:eq|gt|gte|lt|lte|like|ilike):[a-zA-ZÀ-ž0-9-:.%]+)*$',
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
      accessPermission: {
        type: 'object',
        properties: {
          documentId: {
            $ref: '#/components/schemas/documentId',
          },
          accountId: {
            $ref: '#/components/schemas/accountId',
          },
          accessLevel: {
            type: 'string',
          },
        },
        required: ['documentId', 'accountId', 'accessLevel'],
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
          organization: {
            type: 'string',
            description: 'Organization of signer',
          },
          signed: {
            type: 'boolean',
            description: 'Indication if the user signed',
          },
        },
        required: ['name', 'emailAddress', 'organization'],
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
      statsDocuments: {
        description: 'Documents statistics',
        type: 'object',
        properties: {
          locations: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/statsDocument',
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
export class CertificateManagementController {
  constructor(
    @inject(SessionServiceBindings.SESSION_SERVICE)
    public sessionService: SessionService,
    @inject(CertificateServiceBindings.CERTIFICATE_SERVICE)
    public certificateService: CertificateService,
    @inject(NotificationServiceBindings.NOTIFICATION_SERVICE)
    public notificationService: NotificationService,
  ) {}

  /**
   * Provides registration capability for adding comments to an existing
certificate.
   *
   * @param certificateId
   * @param _requestBody Add a new comment
   */
  @operation(
    'post',
    '/certificate-mgmt/certificates/{certificateId}/comments',
    {
      tags: ['Certificate Management'],
      summary: 'Add comments to certificate',
      description:
        'Provides registration capability for adding comments to an existing certificate.',
      operationId: 'add-comment',
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
          $ref: '#/components/parameters/certificateIdParam',
        },
      ],
      requestBody: {
        $ref: '#/components/requestBodies/addCommentRequest',
      },
      responses: {
        '204': {
          description: 'Successfully posted comment',
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
  async addComment(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: UserProfile,
    @param({
      name: 'certificateId',
      in: 'path',
      required: true,
      schema: {
        $ref: '#/components/parameters/certificateIdParam',
      },
    })
    certificateId: CertificateId,
    @requestBody({
      description: 'Add a new comment',
      content: {
        'application/json': {
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
      },
    })
    _requestBody: {
      comment: string;
    },
  ): Promise<unknown> {
    // Check if session exist and is valid
    await this.sessionService.checkSession(currentUser);

    // Add comment to certificate
    await this.certificateService.newComment(
      currentUser,
      certificateId,
      _requestBody.comment,
    );

    return;
  }

  /**
   * Provides retrieval capability for returning a certificate comments
   *
   * @param certificateId
   * @returns List of comments
   */
  @operation('get', '/certificate-mgmt/certificates/{certificateId}/comments', {
    tags: ['Certificate Management'],
    summary: 'Retrieve list of comments',
    description:
      'Provides retrieval capability for returning a certificate comments',
    operationId: 'get-comments',
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
        $ref: '#/components/parameters/certificateIdParam',
      },
    ],
    responses: {
      '200': {
        $ref: '#/components/responses/getCommentsResponse',
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
  async getComments(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: UserProfile,
    @param({
      name: 'certificateId',
      in: 'path',
      required: true,
      schema: {
        $ref: '#/components/parameters/certificateIdParam',
      },
    })
    certificateId: CertificateId,
  ): Promise<Comment[]> {
    // Check if session exist and is valid
    await this.sessionService.checkSession(currentUser);

    // Get comments
    return this.certificateService.getComments(currentUser, certificateId);
  }

  /**
   * Provides retrieval capability for returning signing and transaction history
of certificate.
   *
   * @param certificateId
   * @returns Certificate history
   */
  @operation('get', '/certificate-mgmt/certificates/{certificateId}/history', {
    tags: ['Certificate Management'],
    summary: 'Retrieve certificat history',
    description:
      'Provides retrieval capability for returning signing and transaction history of certificate.',
    operationId: 'get-cert-history',
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
        $ref: '#/components/parameters/certificateIdParam',
      },
    ],
    responses: {
      '200': {
        $ref: '#/components/responses/getCertHistoryResponse',
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
  async getCertHistory(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: UserProfile,
    @param({
      name: 'certificateId',
      in: 'path',
      required: true,
      schema: {
        $ref: '#/components/parameters/certificateIdParam',
      },
    })
    certificateId: CertificateId,
  ): Promise<CertificateHistory> {
    // Check if session exist and is valid
    await this.sessionService.checkSession(currentUser);

    return this.certificateService.getHistory(currentUser, certificateId);
  }

  /**
   * Provides registration capability for adding multiple signers to an existing
certificate.
   *
   * @param certificateId
   * @param _requestBody Add new signers
   * @returns Successful document creation
   */
  @operation('post', '/certificate-mgmt/certificates/{certificateId}/signers', {
    tags: ['Certificate Management'],
    summary: 'Add signer to certificate',
    description:
      'Provides registration capability for adding multiple signers to an existing certificate.',
    operationId: 'add-signer',
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
        $ref: '#/components/parameters/certificateIdParam',
      },
    ],
    requestBody: {
      $ref: '#/components/requestBodies/addSignersRequest',
    },
    responses: {
      '201': {
        $ref: '#/components/responses/addSignersResponse',
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
  async addSigner(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: UserProfile,
    @param({
      name: 'certificateId',
      in: 'path',
      required: true,
      schema: {
        $ref: '#/components/parameters/certificateIdParam',
      },
    })
    certificateId: CertificateId,
    @requestBody({
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
    })
    _requestBody: Signer[],
  ): Promise<AccountResult[]> {
    // Check if session exist and is valid
    await this.sessionService.checkSession(currentUser);

    // Check internal permissions
    await this.sessionService.checkInternalPermissions(currentUser);

    // // Get certificate
    // const certificate = await this.certificateService.getCertificate(
    //   certificateId,
    //   currentUser,
    //   false,
    // );

    // // Add initial signers
    // const accounts: AccountResult[] = [];
    // if (_requestBody) {
    //   for (const signer of _requestBody) {
    //     const accountId = await this.certificateService.newSigner(
    //       currentUser,
    //       certificate.certificateId,
    //       signer,
    //     );

    //     accounts.push({accountId: accountId});

    //     // Send invitation email
    //     await this.notificationService.sendSignerEmail(
    //       signer.emailAddress,
    //       certificate.certificateId,
    //       signer.name,
    //     );
    //   }
    // }

    // return accounts;
    return;
  }


@operation(
  'post',
  '/certificate-mgmt/documents/accessPermission',
  {
    tags: ['Certificate Management'],
    summary: 'Add access permissions to document ',
    description:
      'Provides registration capability for adding a new document  or version to an existing certificate.',
    operationId: 'add-access-permission',
    security: [
      {
        apiKeyAuth: [],
      },
      {
        bearerAuth: [],
      },
    ],
    
    responses: {
      '201': {
        $ref: '#/components/responses/addDocumentResponse',
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
async addDocumentAccessPermission(
  @inject(AuthenticationBindings.CURRENT_USER)
  currentUser: UserProfile,
  @requestBody({
    description: 'Add a new access permission',
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/accessPermission',
        },
      },
    },
  })
  _requestBody: DocumentAccessPermissionEntity,
): Promise<{permissionId:string}> {
  // Check if session exist and is valid
  await this.sessionService.checkSession(currentUser);

  // Add document access
  const permissionId = await this.certificateService.addAccessPermission(
    _requestBody.documentId, _requestBody.accountId,_requestBody.accessLevel
  );

  return  { permissionId };
}

@operation(
  'get',
  '/certificate-mgmt/documents/{documentId}/accessPermission',
  {
    tags: ['Certificate Management'],
    summary: 'get access permissions to document ',
    description:
      'Provides registration capability for adding a new document  or version to an existing certificate.',
    operationId: 'add-access-permission',
    security: [
      {
        apiKeyAuth: [],
      },
      {
        bearerAuth: [],
      },
    ],
    
    responses: {
      '201': {
        $ref: '#/components/responses/addDocumentResponse',
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
async getDocumentAccessPermission(
  @inject(AuthenticationBindings.CURRENT_USER)
  currentUser: UserProfile,
  @param({
    name: 'documentId',
    in: 'path',
    required: true,
    schema: {
      $ref: '#/components/parameters/documentId',
    },
  })
  documentId: CertificateId,
): Promise<DocumentAccessPermissionEntity[]> {
  // Check if session exist and is valid
  await this.sessionService.checkSession(currentUser);

  // Add document access
  return await this.certificateService.getAccessPermission(documentId);
}

  /**
   * Provides registration capability for adding a new document or version to an
existing certificate.
   *
   * @param ownerId
   * @param _requestBody Add a new document
   * @returns Successful added document
   */
  @operation(
    'post',
    '/certificate-mgmt/documents/{ownerId}',
    {
      tags: ['Certificate Management'],
      summary: 'Add document to certificate',
      description:
        'Provides registration capability for adding a new document  or version to an existing certificate.',
      operationId: 'add-document',
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
          $ref: '#/components/parameters/certificateIdParam',
        },
      ],
      requestBody: {
        $ref: '#/components/requestBodies/addDocumentRequest',
      },
      responses: {
        '201': {
          $ref: '#/components/responses/addDocumentResponse',
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
  async addDocument(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: UserProfile,
    @param({
      name: 'ownerId',
      in: 'path',
      required: true,
      schema: {
        $ref: '#/components/parameters/certificateIdParam',
      },
    })
    ownerId: CertificateId,
    @requestBody({
      description: 'Add a new document',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/documentInitial',
          },
        },
      },
    })
    _requestBody: DocumentInitial,
  ): Promise<DocumentResult> {
    // Check if session exist and is valid
    await this.sessionService.checkSession(currentUser);

    // Add document
    const documentId = await this.certificateService.newDocument(
      currentUser,
      ownerId,
      _requestBody,
    );

    return new DocumentResult({documentId: documentId});
  }

  /**
   * Provides retrieval capability for returning list of certificates that
belongs to the current API user based on the value of the authorization
header.
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
   * @returns List of documents
   */
@operation('get', '/certificate-mgmt/documents', {
  tags: ['Certificate Management'],
  summary: 'Retrieve list of documents',
  description:
    'Provides retrieval capability for returning list of certificates that belongs to the current API user based on the value of the authorization header.',
  operationId: 'get-documents',
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
      $ref: '#/components/responses/getCertificatesResponse',
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
async getDocuments(
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
        '^([,]?[a-zA-Z.]+:(?:eq|gt|gte|lt|lte|like|ilike):[a-zA-ZÀ-ž0-9-:.%*&]+)*$',
    },
    description:
      'The fields to filter result on using format: `fieldname:operator:value`. \nSeparate multiple fiters by a comma.\n|operator|Purpose|\n|--------|-------|\n|eq|Field value equals given value|\n|gt|Field value greater then given value|\n|lt|Field value lesser then given value|\n|gte|Field value greater then / equals given value|\n|lte|Field value lesser then / equals given value|',
  })
  filter: string | undefined,
): Promise< (Document)[]> {
  // Check if session exist and is valid
 const session =  await this.sessionService.checkSession(currentUser);

  // Get list of certificates
  return await this.certificateService.getDocuments(
    session.accountId,
    filter,
    sort,
    limit,
    offset,
  );
}


  /**
   * Provides retrieval capability for returning a signed certificate / PDF
document.
   *
   * @param ownerId
   * @param documentId
   * @returns Download PDF certificate
   */
  @operation(
    'get',
    '/certificate-mgmt/documents/{ownerId}/{documentId}',
    {
      tags: ['Certificate Management'],
      summary: 'Download signed document',
      description:
        'Provides retrieval capability for returning a signed certificate / PDF document.',
      operationId: 'get-document',
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
          $ref: '#/components/parameters/certificateIdParam',
        },
        {
          $ref: '#/components/parameters/documentIdParam',
        },
      ],
      responses: {
        '200': {
          $ref: '#/components/responses/getDocumentResponse',
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
  async getDocument(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: UserProfile,
    @param({
      name: 'ownerId',
      in: 'path',
      required: true,
      schema: {
        $ref: '#/components/parameters/certificateIdParam',
      },
    })
    ownerId: CertificateId,
    @param({
      name: 'documentId',
      in: 'path',
      required: true,
      schema: {
        $ref: '#/components/parameters/documentIdParam',
      },
    })
    documentId: DocumentId,
  ): Promise<string> {
    // Check if session exist and is valid
    await this.sessionService.checkSession(currentUser);

    const document = await this.certificateService.getDocument(
      currentUser,
      ownerId,
      documentId,
    );

    return document;
  }

  /**
   * Provides revoke capability for certificate document.
   *
   * @param certificateId
   * @param documentId
   */
  @operation(
    'post',
    '/certificate-mgmt/certificates/{certificateId}/documents/{documentId}/revoke',
    {
      tags: ['Certificate Management'],
      summary: 'Revoke certificate document',
      description: 'Provides revoke capability for certificate document.',
      operationId: 'revoke-document',
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
          $ref: '#/components/parameters/certificateIdParam',
        },
        {
          $ref: '#/components/parameters/documentIdParam',
        },
      ],
      responses: {
        '204': {
          description: 'Certificate document succesfully revoked',
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
  async revokeDocument(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: UserProfile,
    @param({
      name: 'certificateId',
      in: 'path',
      required: true,
      schema: {
        $ref: '#/components/parameters/certificateIdParam',
      },
    })
    certificateId: CertificateId,
    @param({
      name: 'documentId',
      in: 'path',
      required: true,
      schema: {
        $ref: '#/components/parameters/documentIdParam',
      },
    })
    documentId: DocumentId,
  ): Promise<unknown> {
    // Check if session exist and is valid
    await this.sessionService.checkSession(currentUser);

    await this.certificateService.revokeDocument(
      currentUser,
      certificateId,
      documentId,
    );

    return;
  }
}
