import { IArticle } from '../models';
import ArticleService from '../services/article';
import sinon from 'sinon';
import uut from '../controllers/article';
import { expect } from 'chai';
import httpMocks from 'node-mocks-http';
import mongoose from 'mongoose';
import CommentService from '../services/comment';

describe('ArticleController', () => {
    describe('GET articles', () => {
        it('Should return OK and an articles list when there are stored articles', async () => {
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
            await uut.fetch(request, response, next);

            // Then
            const responseData = response._getJSONData();
            expect(response.statusCode).to.be.eq(200);
            expect(responseData).to.be.length(1);
            expect(responseData[0]).to.be.eql(article);
            expect(mockArticleFetch.getCalls()).to.be.length(1);
            expect(next.called).to.be.false;
            mockArticleFetch.restore();
        });

        it('Should return OK and an empty list when there are no stored articles', async () => {
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
            await uut.fetch(request, response, next);

            // Then
            const responseData = response._getJSONData();
            expect(response.statusCode).to.be.eq(200);
            expect(responseData).to.be.length(0);
            expect(mockArticleFetch.getCalls()).to.be.length(1);
            expect(next.called).to.be.false;
            mockArticleFetch.restore();
        });
    });

    describe('GET article', () => {
        it('Should return OK and the article when matching the supplied ID', async () => {
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
            await uut.find(request, response, next);

            // Then
            const responseData = response._getJSONData();
            expect(response.statusCode).to.be.eq(200);
            expect(responseData).to.be.eql(article);
            expect(mockArticleFind.getCalls()).to.be.length(1);
            expect(next.called).to.be.false;
            mockArticleFind.restore();
        });

        it('Should call Next() handler when not matching the supplied ID', async () => {
            // Given
            const articleId: string = new mongoose.Types.ObjectId().toString();
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
            await uut.find(request, response, next);

            // Then
            expect(mockArticleFind.getCalls()).to.be.length(1);
            expect(next.called).to.be.true;
            mockArticleFind.restore();
        });
    });

    describe('POST article', () => {
        it('Should return Created when creating a new article', async () => {
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
            await uut.create(request, response, next);

            // Then
            expect(response.statusCode).to.be.eq(201);
            expect(mockArticleCreate.getCalls()).to.be.length(1);
            expect(next.called).to.be.false;
            mockArticleCreate.restore();
        });
    });

    describe('PUT article', () => {
        it('Should return OK when updating an existing article', async () => {
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
            await uut.update(request, response, next);

            // Then
            const responseData = response._getJSONData();
            expect(response.statusCode).to.be.eq(200);
            expect(responseData).to.be.eql(article);
            expect(mockArticleUpdate.getCalls()).to.be.length(1);
            expect(next.called).to.be.false;
            mockArticleUpdate.restore();
        });

        it('Should call Next() handler when request IDs do not match', async () => {
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
            await uut.update(request, response, next);

            // Then
            expect(mockArticleUpdate.getCalls()).to.be.length(0);
            expect(next.called).to.be.true;
            mockArticleUpdate.restore();
        });

        it('Should call Next() handler when trying to update a non-existing article', async () => {
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
            await uut.update(request, response, next);

            // Then
            expect(mockArticleUpdate.getCalls()).to.be.length(1);
            expect(next.called).to.be.true;
            mockArticleUpdate.restore();
        });
    });

    describe('DELETE article', () => {
        it('Should return OK when removing an existing article', async () => {
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
            await uut.remove(request, response, next);

            // Then
            expect(response.statusCode).to.be.eq(200);
            expect(mockArticleRemove.getCalls()).to.be.length(1);
            expect(mockCommentRemoveByArticleId.getCalls()).to.be.length(1);
            mockArticleRemove.restore();
            mockCommentRemoveByArticleId.restore();
        });

        it('Should call Next() when trying to remove a non-existing article', async () => {
            // Given
            const articleId: string = new mongoose.Types.ObjectId().toString();
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
            await uut.remove(request, response, next);

            // Then
            expect(mockArticleRemove.getCalls()).to.be.length(1);
            expect(next.called).to.be.true;
            expect(mockCommentRemoveByArticleId.getCalls()).to.be.length(0);
            mockArticleRemove.restore();
            mockCommentRemoveByArticleId.restore();
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
