import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongdbDataSource} from '../datasources';
import {
  CommentEntity,
  CommentEntityRelations,
} from '../entities';

export class CommentsRepository extends DefaultCrudRepository<
  CommentEntity,
  typeof CommentEntity.prototype.commentId,
  CommentEntityRelations 
> {
  constructor(@inject('datasources.mongdb') dataSource: MongdbDataSource) {
    super(CommentEntity, dataSource); 
  }
}
