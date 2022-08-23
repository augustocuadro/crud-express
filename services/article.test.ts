import { IArticle } from '../models';
import mongoose from 'mongoose';
import { Article } from '../models';
import ArticleService from './article';
import { expect } from 'chai';
import sinon from 'sinon';

describe('when consuming ArticleService', () => {
    describe('and retrieving articles', () => {
        describe('and there are stored articles', () => {
            it('should return an articles list', async () => {
                // Given
                const article1 = getArticle();
                const article2 = getArticle();
                const articlesList: IArticle[] = [article1, article2];

                const mockArticleFind = sinon.stub(Article, 'find').returns({
                    lean: sinon.stub().returns({
                        exec: sinon.stub().resolves(articlesList)
                    })
                } as any);

                // When
                const result = await ArticleService.fetch();

                // Then
                expect(result).to.be.eq(articlesList);
                expect(result).to.contain(article1);
                expect(result).to.contain(article2);
                expect(mockArticleFind.getCalls()).to.be.length(1);
                mockArticleFind.restore();
            });
        });

        describe('and there are no stored articles', () => {
            it('Should return an empty list', async () => {
                // Given
                const mockArticleFind = sinon.stub(Article, 'find').returns({
                    lean: sinon.stub().returns({
                        exec: sinon.stub().resolves([])
                    })
                } as any);

                // When
                const result = await ArticleService.fetch();

                // Then
                expect(result).to.be.length(0);
                expect(mockArticleFind.getCalls()).to.be.length(1);
                mockArticleFind.restore();
            });
        });
    });

    describe('when retrieving articles by ID', () => {
        describe('and matching the supplied ID', () => {
            it('should return the article', async () => {
                // Given
                const article = getArticle();
                const mockArticleFindById = sinon
                    .stub(Article, 'findById')
                    .returns({
                        lean: sinon.stub().returns({
                            exec: sinon.stub().resolves(article)
                        })
                    } as any);

                // When
                const result = await ArticleService.find(article.id);

                // Then
                expect(result).to.be.eq(article);
                expect(mockArticleFindById.getCalls()).to.be.length(1);
                mockArticleFindById.restore();
            });
        });

        describe('and not matching the supplied ID', () => {
            it('should return null', async () => {
                // Given
                const articleId = new mongoose.Types.ObjectId().toString();
                const mockArticleFindById = sinon
                    .stub(Article, 'findById')
                    .returns({
                        lean: sinon.stub().returns({
                            exec: sinon.stub().resolves(null)
                        })
                    } as any);

                // When
                const result = await ArticleService.find(articleId);

                // Then
                expect(result).to.be.eq(null);
                expect(mockArticleFindById.getCalls()).to.be.length(1);
                mockArticleFindById.restore();
            });
        });
    });

    describe('when creating a new article', () => {
        it('should create a new article', async () => {
            // Given
            const article = getArticle();

            const mockArticleCreate = sinon.stub(Article, 'create');
            mockArticleCreate.resolves(article);

            // When
            const result = await ArticleService.create(article);

            // Then
            expect(result).to.be.eq(article);
            expect(mockArticleCreate.getCalls()).to.be.length(1);
            mockArticleCreate.restore();
        });
    });

    describe('when updating an existing article', () => {
        describe('and matching the supplied ID', () => {
            it('should return the updated article', async () => {
                // Given
                const article = getArticle();

                const mockArticleFindByIdAndUpdate = sinon.stub(
                    Article,
                    'findByIdAndUpdate'
                );
                mockArticleFindByIdAndUpdate.returns({
                    exec: sinon.stub().resolves(article)
                } as any);

                // When
                const result = await ArticleService.update(article.id, article);

                // Then
                expect(result).to.be.eq(article);
                expect(mockArticleFindByIdAndUpdate.getCalls()).to.be.length(1);
                mockArticleFindByIdAndUpdate.restore();
            });
        });

        describe('and not matching the supplied ID', () => {
            it('Should return null', async () => {
                // Given
                const article = getArticle();

                const mockArticleFindByIdAndUpdate = sinon.stub(
                    Article,
                    'findByIdAndUpdate'
                );
                mockArticleFindByIdAndUpdate.returns({
                    exec: sinon.stub().resolves(null)
                } as any);

                // When
                const result = await ArticleService.update(article.id, article);

                // Then
                expect(result).to.be.eq(null);
                expect(mockArticleFindByIdAndUpdate.getCalls()).to.be.length(1);
                mockArticleFindByIdAndUpdate.restore();
            });
        });
    });

    describe('when deleting an article', () => {
        describe('and article is successfully deleted', () => {
            it('should return the deleted article', async () => {
                // Given
                const article = getArticle();

                const mockArticleFindOneAndDelete = sinon.stub(
                    Article,
                    'findOneAndDelete'
                );
                mockArticleFindOneAndDelete.returns({
                    exec: sinon.stub().resolves(article)
                } as any);

                // When
                const result = await ArticleService.remove(article.id);

                // Then
                expect(result).to.be.eq(article);
                expect(mockArticleFindOneAndDelete.getCalls()).to.be.length(1);
                mockArticleFindOneAndDelete.restore();
            });
        });

        describe('and article does not exist', () => {
            it('should return null', async () => {
                // Given
                const articleId = new mongoose.Types.ObjectId().toString();
                const mockArticleFindOneAndDelete = sinon.stub(
                    Article,
                    'findOneAndDelete'
                );
                mockArticleFindOneAndDelete.returns({
                    exec: sinon.stub().resolves(null)
                } as any);

                // When
                const result = await ArticleService.remove(articleId);

                // Then
                expect(result).to.be.eq(null);
                expect(mockArticleFindOneAndDelete.getCalls()).to.be.length(1);
                mockArticleFindOneAndDelete.restore();
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
