import {model, property} from '@loopback/repository';
import {DocumentId} from './document-id.model';

/**
 * The model class is generated from OpenAPI schema - documentResult
 * Document result details
 */
@model({name: 'documentResult'})
export class DocumentResult {
  constructor(data?: Partial<DocumentResult>) {
    if (data != null && typeof data === 'object') {
      Object.assign(this, data);
    }
  }

  /**
   * ID of document
   */
  @property({required: true, jsonSchema: {
  $ref: '#/components/schemas/documentId',
}})
  documentId: DocumentId;

}

export interface DocumentResultRelations {
  // describe navigational properties here
}

export type DocumentResultWithRelations = DocumentResult & DocumentResultRelations;


