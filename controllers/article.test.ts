import { IArticle } from '../models';
import ArticleService from '../services/article';
import sinon from 'sinon';
import ArticleController from '../controllers/article';
import { expect } from 'chai';
import httpMocks from 'node-mocks-http';
import mongoose from 'mongoose';
import CommentService from '../services/comment';

describe('when reaching /articles route', () => {
    describe('and retrieving articles', () => {
        describe('and there are stored articles', () => {
            it('should return OK and an articles list', async () => {
                // Given
                const article = getArticle();
                const articlesList: IArticle[] = [article];
                const request = httpMocks.createRequest({
                    method: 'GET',
                    url: '/api/articles'
                });
                const response = httpMocks.createResponse();
                const next = sinon.spy();

                const mockArticleFetch = sinon.stub(ArticleService, 'fetch');
                mockArticleFetch.resolves(articlesList);

                // When
                await ArticleController.fetch(request, response, next);

                // Then
                const responseData = response._getJSONData();
                expect(response.statusCode).to.be.eq(200);
                expect(responseData).to.be.length(1);
                expect(responseData[0]).to.be.eql(article);
                expect(mockArticleFetch.getCalls()).to.be.length(1);
                expect(next.called).to.be.false;
                mockArticleFetch.restore();
            });
        });

        describe('and there are no stored articles', () => {
            it('should return OK and an empty list', async () => {
                // Given
                const request = httpMocks.createRequest({
                    method: 'GET',
                    url: '/api/articles'
                });
                const response = httpMocks.createResponse();
                const next = sinon.spy();

                const mockArticleFetch = sinon.stub(ArticleService, 'fetch');
                mockArticleFetch.resolves([]);

                // When
                await ArticleController.fetch(request, response, next);

                // Then
                const responseData = response._getJSONData();
                expect(response.statusCode).to.be.eq(200);
                expect(responseData).to.be.length(0);
                expect(mockArticleFetch.getCalls()).to.be.length(1);
                expect(next.called).to.be.false;
                mockArticleFetch.restore();
            });
        });
    });

    describe('and retrieving articles by ID', () => {
        describe('and matching the supplied ID', () => {
            it('should return OK and the article', async () => {
                // Given
                const article = getArticle();
                const request = httpMocks.createRequest({
                    method: 'GET',
                    url: `/api/articles/${article.id}`,
                    params: {
                        id: article.id
                    }
                });
                const response = httpMocks.createResponse();
                const next = sinon.spy();

                const mockArticleFind = sinon.stub(ArticleService, 'find');
                mockArticleFind.resolves(article);

                // When
                await ArticleController.find(request, response, next);

                // Then
                const responseData = response._getJSONData();
                expect(response.statusCode).to.be.eq(200);
                expect(responseData).to.be.eql(article);
                expect(mockArticleFind.getCalls()).to.be.length(1);
                expect(next.called).to.be.false;
                mockArticleFind.restore();
            });
        });

        describe('and not matching the supplied ID', () => {
            it('should call Next() handler', async () => {
                // Given
                const articleId: string =
                    new mongoose.Types.ObjectId().toString();
                const request = httpMocks.createRequest({
                    method: 'GET',
                    url: `/api/articles/${articleId}`,
                    params: {
                        id: articleId
                    }
                });
                const response = httpMocks.createResponse();
                const next = sinon.spy();

                const mockArticleFind = sinon.stub(ArticleService, 'find');
                mockArticleFind.resolves(null);

                // When
                await ArticleController.find(request, response, next);

                // Then
                expect(mockArticleFind.getCalls()).to.be.length(1);
                expect(next.called).to.be.true;
                mockArticleFind.restore();
            });
        });
    });

    describe('and creating a new article', () => {
        it('should return Created', async () => {
            // Given
            const article = getArticle();
            const request = httpMocks.createRequest({
                method: 'GET',
                url: `/api/articles/${article.id}`,
                params: {
                    id: article.id
                }
            });
            const response = httpMocks.createResponse();
            const next = sinon.spy();

            const mockArticleCreate = sinon.stub(ArticleService, 'create');
            mockArticleCreate.resolves(article);

            // When
            await ArticleController.create(request, response, next);

            // Then
            expect(response.statusCode).to.be.eq(201);
            expect(mockArticleCreate.getCalls()).to.be.length(1);
            expect(next.called).to.be.false;
            mockArticleCreate.restore();
        });
    });

    describe('and updating an existing article', () => {
        describe('and the article is successfully updated', () => {
            it('should return OK', async () => {
                // Given
                const article = getArticle();
                const request = httpMocks.createRequest({
                    method: 'PUT',
                    url: `/api/articles/${article.id}`,
                    params: {
                        id: article.id
                    },
                    body: article
                });
                const response = httpMocks.createResponse();
                const next = sinon.spy();

                const mockArticleUpdate = sinon.stub(ArticleService, 'update');
                mockArticleUpdate.resolves(article);

                // When
                await ArticleController.update(request, response, next);

                // Then
                const responseData = response._getJSONData();
                expect(response.statusCode).to.be.eq(200);
                expect(responseData).to.be.eql(article);
                expect(mockArticleUpdate.getCalls()).to.be.length(1);
                expect(next.called).to.be.false;
                mockArticleUpdate.restore();
            });
        });

        describe('and request IDs do not match', () => {
            it('should call Next() handler', async () => {
                // Given
                const article = getArticle();
                const otherArticleId: string =
                    new mongoose.Types.ObjectId().toString();
                const request = httpMocks.createRequest({
                    method: 'PUT',
                    url: `/api/articles/${otherArticleId}`,
                    params: {
                        id: otherArticleId
                    },
                    body: article
                });
                const response = httpMocks.createResponse();
                const next = sinon.spy();

                const mockArticleUpdate = sinon.stub(ArticleService, 'update');

                // When
                await ArticleController.update(request, response, next);

                // Then
                expect(mockArticleUpdate.getCalls()).to.be.length(0);
                expect(next.called).to.be.true;
                mockArticleUpdate.restore();
            });
        });

        describe('and the article does not exist', () => {
            it('should call Next() handler', async () => {
                // Given
                const article = getArticle();
                const request = httpMocks.createRequest({
                    method: 'PUT',
                    url: `/api/articles/${article.id}`,
                    params: {
                        id: article.id
                    },
                    body: article
                });
                const response = httpMocks.createResponse();
                const next = sinon.spy();

                const mockArticleUpdate = sinon.stub(ArticleService, 'update');
                mockArticleUpdate.resolves(null);

                // When
                await ArticleController.update(request, response, next);

                // Then
                expect(mockArticleUpdate.getCalls()).to.be.length(1);
                expect(next.called).to.be.true;
                mockArticleUpdate.restore();
            });
        });
    });

    describe('and deleting an article', () => {
        describe('and article is successfully deleted', () => {
            it('should return OK', async () => {
                // Given
                const article = getArticle();
                const request = httpMocks.createRequest({
                    method: 'DELETE',
                    url: `/api/articles/${article.id}`,
                    params: {
                        id: article.id
                    }
                });
                const response = httpMocks.createResponse();
                const next = sinon.spy();

                const mockArticleRemove = sinon.stub(ArticleService, 'remove');
                mockArticleRemove.resolves(article);
                const mockCommentRemoveByArticleId = sinon.stub(
                    CommentService,
                    'removeByArticleId'
                );
                mockCommentRemoveByArticleId.resolves();

                // When
                await ArticleController.remove(request, response, next);

                // Then
                expect(response.statusCode).to.be.eq(200);
                expect(mockArticleRemove.getCalls()).to.be.length(1);
                expect(mockCommentRemoveByArticleId.getCalls()).to.be.length(1);
                mockArticleRemove.restore();
                mockCommentRemoveByArticleId.restore();
            });
        });

        describe('and article does not exist', () => {
            it('should call Next() handler', async () => {
                // Given
                const articleId: string =
                    new mongoose.Types.ObjectId().toString();
                const request = httpMocks.createRequest({
                    method: 'DELETE',
                    url: `/api/articles/${articleId}`,
                    params: {
                        id: articleId
                    }
                });
                const response = httpMocks.createResponse();
                const next = sinon.spy();

                const mockArticleRemove = sinon.stub(ArticleService, 'remove');
                mockArticleRemove.resolves(null);
                const mockCommentRemoveByArticleId = sinon.stub(
                    CommentService,
                    'removeByArticleId'
                );
                mockCommentRemoveByArticleId.resolves();

                // When
                await ArticleController.remove(request, response, next);

                // Then
                expect(mockArticleRemove.getCalls()).to.be.length(1);
                expect(next.called).to.be.true;
                expect(mockCommentRemoveByArticleId.getCalls()).to.be.length(0);
                mockArticleRemove.restore();
                mockCommentRemoveByArticleId.restore();
            });
        });
    });
});

const getArticle = (): IArticle => {
    return {
        author: 'Author',
        body: 'Test',
        id: new mongoose.Types.ObjectId().toString(),
        title: 'Title'
    };
};
