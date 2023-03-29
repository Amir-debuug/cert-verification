/**
 * The model type is generated from OpenAPI schema - codeRequest
 * Request for new authorization code
 */
export type CodeRequest =
  | {
      emailAddress: string;
      phoneNumber?: string;
    }
  | {
      emailAddress: string;
      phoneNumber: string;
    };
