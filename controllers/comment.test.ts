import { IArticle, IComment } from '../models';
import httpMocks from 'node-mocks-http';
import sinon from 'sinon';
import CommentService from '../services/comment';
import CommentController from './comment';
import { expect } from 'chai';
import mongoose from 'mongoose';
import ArticleService from '../services/article';

describe('when reaching /comments route', () => {
    describe('and retrieving comments', () => {
        describe('and there are stored comments', () => {
            it('should return OK and a comments list', async () => {
                // Given
                const articleId = new mongoose.Types.ObjectId().toString();
                const comment1 = getComment(articleId);
                const comment2 = getComment(articleId);
                const commentsList: IComment[] = [comment1, comment2];
                const request = httpMocks.createRequest({
                    method: 'GET',
                    url: `/api/comments?article=${articleId}`,
                    query: {
                        article: articleId
                    }
                });
                const response = httpMocks.createResponse();
                const next = sinon.spy();

                const mockCommentFindByArticleId = sinon.stub(
                    CommentService,
                    'findByArticleId'
                );
                mockCommentFindByArticleId.resolves(commentsList);

                // When
                await CommentController.find(request, response, next);

                // Then
                const responseData = response._getJSONData();
                expect(response.statusCode).to.be.eq(200);
                expect(responseData).to.be.length(2);
                expect(responseData[0]).to.be.eql(comment1);
                expect(responseData[1]).to.be.eql(comment2);
                expect(mockCommentFindByArticleId.getCalls()).to.be.length(1);
                expect(next.called).to.be.false;
                mockCommentFindByArticleId.restore();
            });
        });

        describe('and there are no comments for a given article', () => {
            it('should return OK and an empty list', async () => {
                // Given
                const articleId = new mongoose.Types.ObjectId().toString();
                const request = httpMocks.createRequest({
                    method: 'GET',
                    url: `/api/comments?article=${articleId}`,
                    query: {
                        article: articleId
                    }
                });
                const response = httpMocks.createResponse();
                const next = sinon.spy();

                const mockCommentFindByArticleId = sinon.stub(
                    CommentService,
                    'findByArticleId'
                );
                mockCommentFindByArticleId.resolves([]);

                // When
                await CommentController.find(request, response, next);

                // Then
                const responseData = response._getJSONData();
                expect(response.statusCode).to.be.eq(200);
                expect(responseData).to.be.length(0);
                expect(mockCommentFindByArticleId.getCalls()).to.be.length(1);
                expect(next.called).to.be.false;
                mockCommentFindByArticleId.restore();
            });
        });

        describe('and ArticleId is not provided', () => {
            it('should return call Next() handler', async () => {
                // Given
                const request = httpMocks.createRequest({
                    method: 'GET',
                    url: `/api/comments?article=`
                });
                const response = httpMocks.createResponse();
                const next = sinon.spy();

                const mockCommentFindByArticleId = sinon.stub(
                    CommentService,
                    'findByArticleId'
                );
                mockCommentFindByArticleId.resolves([]);

                // When
                await CommentController.find(request, response, next);

                // Then
                expect(mockCommentFindByArticleId.getCalls()).to.be.length(0);
                expect(next.called).to.be.true;
                mockCommentFindByArticleId.restore();
            });
        });
    });

    describe('and posting a new comment', () => {
        describe('and comment is successfully created', () => {
            it('should return Created', async () => {
                // Given
                const comment = getComment();
                const request = httpMocks.createRequest({
                    method: 'POST',
                    url: `/api/comments`,
                    body: comment
                });
                const response = httpMocks.createResponse();
                const next = sinon.spy();

                const mockArticleFind = sinon.stub(ArticleService, 'find');
                mockArticleFind.resolves(comment.article);
                const mockCommentCreate = sinon.stub(CommentService, 'create');
                mockCommentCreate.resolves(comment);

                // When
                await CommentController.create(request, response, next);

                // Then
                const responseData = response._getJSONData();
                expect(response.statusCode).to.be.eq(201);
                expect(responseData).to.be.eql(comment);
                expect(mockArticleFind.getCalls()).to.be.length(1);
                expect(mockCommentCreate.getCalls()).to.be.length(1);
                expect(next.called).to.be.false;
                mockArticleFind.restore();
                mockCommentCreate.restore();
            });
        });

        describe('and the article is not provided', () => {
            it('should call Next() handler', async () => {
                // Given
                const request = httpMocks.createRequest({
                    method: 'POST',
                    url: `/api/comments`,
                    body: {
                        body: 'Test',
                        author: 'Test'
                    }
                });
                const response = httpMocks.createResponse();
                const next = sinon.spy();

                const mockArticleFind = sinon.stub(ArticleService, 'find');
                const mockCommentCreate = sinon.stub(CommentService, 'create');

                // When
                await CommentController.create(request, response, next);

                // Then
                expect(mockArticleFind.getCalls()).to.be.length(0);
                expect(mockCommentCreate.getCalls()).to.be.length(0);
                expect(next.called).to.be.true;
                mockArticleFind.restore();
                mockCommentCreate.restore();
            });
        });

        describe('and the article does not exist', () => {
            it('should call Next() handler', async () => {
                // Given
                const comment = getComment();
                const request = httpMocks.createRequest({
                    method: 'POST',
                    url: `/api/comments`,
                    body: comment
                });
                const response = httpMocks.createResponse();
                const next = sinon.spy();

                const mockArticleFind = sinon.stub(ArticleService, 'find');
                mockArticleFind.resolves(null);
                const mockCommentCreate = sinon.stub(CommentService, 'create');

                // When
                await CommentController.create(request, response, next);

                // Then
                expect(mockArticleFind.getCalls()).to.be.length(1);
                expect(mockCommentCreate.getCalls()).to.be.length(0);
                expect(next.called).to.be.true;
                mockArticleFind.restore();
                mockCommentCreate.restore();
            });
        });
    });

    describe('and updating an existing comment', () => {
        describe('and comment is successfully updated', () => {
            it('should return OK', async () => {
                // Given
                const comment = getComment();
                const request = httpMocks.createRequest({
                    method: 'PUT',
                    url: `/api/comments/${comment.id}`,
                    params: {
                        id: comment.id
                    },
                    body: getCommentRequestBody(comment.id, comment.article.id)
                });
                const response = httpMocks.createResponse();
                const next = sinon.spy();

                const mockArticleFind = sinon.stub(ArticleService, 'find');
                mockArticleFind.resolves(comment.article);
                const mockCommentUpdate = sinon.stub(CommentService, 'update');
                mockCommentUpdate.resolves(comment);

                // When
                await CommentController.update(request, response, next);

                // Then
                const responseData = response._getJSONData();
                expect(response.statusCode).to.be.eq(200);
                expect(responseData).to.be.eql(comment);
                expect(mockCommentUpdate.getCalls()).to.be.length(1);
                expect(mockArticleFind.getCalls()).to.be.length(1);
                expect(next.called).to.be.false;
                mockArticleFind.restore();
                mockCommentUpdate.restore();
            });
        });

        describe('and the article is not provided', () => {
            it('should call Next() handler', async () => {
                // Given
                const comment = getComment();
                const request = httpMocks.createRequest({
                    method: 'PUT',
                    url: `/api/comments/${comment.id}`,
                    params: {
                        id: comment.id
                    },
                    body: {
                        author: 'Test',
                        body: 'Test'
                    }
                });
                const response = httpMocks.createResponse();
                const next = sinon.spy();

                const mockArticleFind = sinon.stub(ArticleService, 'find');
                const mockCommentUpdate = sinon.stub(CommentService, 'update');

                // When
                await CommentController.update(request, response, next);

                // Then
                expect(mockArticleFind.getCalls()).to.be.length(0);
                expect(mockCommentUpdate.getCalls()).to.be.length(0);
                expect(next.called).to.be.true;
                mockArticleFind.restore();
                mockCommentUpdate.restore();
            });
        });

        describe('and request IDs do not match', () => {
            it('should call Next() handler', async () => {
                // Given
                const comment = getComment();
                const request = httpMocks.createRequest({
                    method: 'PUT',
                    url: `/api/comments/${comment.id}`,
                    params: {
                        id: comment.id
                    },
                    body: {
                        id: 'SomeOtherId',
                        author: comment.author,
                        body: comment.body,
                        article: comment.article
                    }
                });
                const response = httpMocks.createResponse();
                const next = sinon.spy();

                const mockArticleFind = sinon.stub(ArticleService, 'find');
                const mockCommentUpdate = sinon.stub(CommentService, 'update');

                // When
                await CommentController.update(request, response, next);

                // Then
                expect(mockArticleFind.getCalls()).to.be.length(0);
                expect(mockCommentUpdate.getCalls()).to.be.length(0);
                expect(next.called).to.be.true;
                mockArticleFind.restore();
                mockCommentUpdate.restore();
            });
        });

        describe('and the comment is linked to a non-existing article', () => {
            it('should call Next() handler', async () => {
                // Given
                const comment = getComment();
                const request = httpMocks.createRequest({
                    method: 'PUT',
                    url: `/api/comments/${comment.id}`,
                    params: {
                        id: comment.id
                    },
                    body: getCommentRequestBody(comment.id, comment.article.id)
                });
                const response = httpMocks.createResponse();
                const next = sinon.spy();

                const mockArticleFind = sinon.stub(ArticleService, 'find');
                mockArticleFind.resolves(null);
                const mockCommentUpdate = sinon.stub(CommentService, 'update');

                // When
                await CommentController.update(request, response, next);

                // Then
                expect(mockArticleFind.getCalls()).to.be.length(1);
                expect(mockCommentUpdate.getCalls()).to.be.length(0);
                expect(next.called).to.be.true;
                mockArticleFind.restore();
                mockCommentUpdate.restore();
            });
        });
    });

    describe('and deleting a comment', () => {
        describe('and comment is successfully deleted', () => {
            it('should return OK', async () => {
                // Given
                const comment = getComment();
                const request = httpMocks.createRequest({
                    method: 'DELETE',
                    url: `/api/comments/${comment.id}`,
                    params: {
                        id: comment.id
                    }
                });
                const response = httpMocks.createResponse();
                const next = sinon.spy();

                const mockCommentRemove = sinon.stub(CommentService, 'remove');
                mockCommentRemove.resolves(comment);

                // When
                await CommentController.remove(request, response, next);

                // Then
                const responseData = response._getJSONData();
                expect(response.statusCode).to.be.eq(200);
                expect(responseData).to.be.eql(comment);
                expect(mockCommentRemove.getCalls()).to.be.length(1);
                expect(next.called).to.be.false;
                mockCommentRemove.restore();
            });
        });

        describe('and comment does not exist', () => {
            it('should call Next() handler', async () => {
                // Given
                const comment = getComment();
                const request = httpMocks.createRequest({
                    method: 'DELETE',
                    url: `/api/comments/${comment.id}`,
                    params: {
                        id: comment.id
                    }
                });
                const response = httpMocks.createResponse();
                const next = sinon.spy();

                const mockCommentRemove = sinon.stub(CommentService, 'remove');
                mockCommentRemove.resolves(null);

                // When
                await CommentController.remove(request, response, next);

                // Then
                expect(mockCommentRemove.getCalls()).to.be.length(1);
                expect(next.called).to.be.true;
                mockCommentRemove.restore();
            });
        });
    });
});

const getComment = (articleId?: string): IComment => {
    const article: IArticle = {
        author: 'Author',
        body: 'Test',
        id:
            articleId != undefined
                ? articleId
                : new mongoose.Types.ObjectId().toString(),
        title: 'Title'
    };

    return {
        article: article,
        author: 'Test',
        body: 'Test',
        id: new mongoose.Types.ObjectId().toString()
    };
};

const getCommentRequestBody = (commentId?: string, articleId?: string) => {
    return {
        article:
            articleId != undefined
                ? articleId
                : new mongoose.Types.ObjectId().toString(),
        author: 'Test',
        body: 'Test',
        id:
            commentId != undefined
                ? commentId
                : new mongoose.Types.ObjectId().toString()
    };
};
