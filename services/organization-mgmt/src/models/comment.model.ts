import {model, property} from '@loopback/repository';
import {CommentId} from './comment-id.model';

/**
 * The model class is generated from OpenAPI schema - comment
 * Comment details
 */
@model({name: 'comment'})
export class Comment {
  constructor(data?: Partial<Comment>) {
    if (data != null && typeof data === 'object') {
      Object.assign(this, data);
    }
  }

  /**
   * ID of comment
   */
  @property({required: true, jsonSchema: {
  $ref: '#/components/schemas/commentId',
}})
  commentId: CommentId;

  /**
   * Comment (text) to add
   */
  @property({required: true, jsonSchema: {
  type: 'string',
  description: 'Comment (text) to add',
  minLength: 1,
}})
  comment: string;

}

export interface CommentRelations {
  // describe navigational properties here
}

export type CommentWithRelations = Comment & CommentRelations;


