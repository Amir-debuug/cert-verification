import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {
    // add it to the model definition
    mongodb: {collection: 'comments'},
  },
})
export class CommentEntity extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  commentId: string;

  @property({
    type: 'string',
    required: true,
  })
  certificateId: string;

  @property({
    type: 'string',
    required: true,
  })
  accountId: string;

  @property({
    type: 'string',
    required: true,
  })
  comment: string;

  @property({
    type: 'string',
    required: true,
  })
  createdAt: string;

  constructor(data?: Partial<CommentEntity>) {
    super(data);
  }
}

export interface CommentEntityRelations {
  // describe navigational properties here
}

export type CommentEntityWithRelations = CommentEntity & CommentEntityRelations;
