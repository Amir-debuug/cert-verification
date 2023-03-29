import {DocumentId} from './document-id.model';
import {DocumentInitial} from './document-initial.model';
/**
 * The model type is generated from OpenAPI schema - document
 * Document details
 */
export type Document = {
  documentId: DocumentId;
} & DocumentInitial;
