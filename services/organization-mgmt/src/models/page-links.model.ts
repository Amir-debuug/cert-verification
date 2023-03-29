import {model, property} from '@loopback/repository';

/**
 * The model class is generated from OpenAPI schema - pageLinks
 * Links object for pagination of results
 */
@model({name: 'pageLinks'})
export class PageLinks {
  constructor(data?: Partial<PageLinks>) {
    if (data != null && typeof data === 'object') {
      Object.assign(this, data);
    }
  }

  /**
   * URI for retrieving current page
   */
  @property({required: true, jsonSchema: {
  type: 'string',
  description: 'URI for retrieving current page',
  minLength: 1,
}})
  self: string;

  /**
   * URI for retrieving first page
   */
  @property({required: true, jsonSchema: {
  type: 'string',
  description: 'URI for retrieving first page',
  minLength: 1,
}})
  first: string;

  /**
   * URI for retrieving prev page
   */
  @property({jsonSchema: {
  type: 'string',
  description: 'URI for retrieving prev page',
  minLength: 1,
}})
  prev?: string;

  /**
   * URI for retrieving next page
   */
  @property({jsonSchema: {
  type: 'string',
  description: 'URI for retrieving next page',
  minLength: 1,
}})
  next?: string;

  /**
   * URI for retrieving last page
   */
  @property({required: true, jsonSchema: {
  type: 'string',
  description: 'URI for retrieving last page',
  minLength: 1,
}})
  last: string;

}

export interface PageLinksRelations {
  // describe navigational properties here
}

export type PageLinksWithRelations = PageLinks & PageLinksRelations;


