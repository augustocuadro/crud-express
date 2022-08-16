import { IArticle } from '../models';
import mongoose from 'mongoose';
import { Article } from '../models';
import uut from './article';
import { expect } from 'chai';
import sinon from 'sinon';

describe('ArticleService', () => {
    describe('Fetch articles', () => {
        it('Should return an articles list when there are stored articles', async () => {
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
            const result = await uut.fetch();

            // Then
            expect(result).to.be.eq(articlesList);
            expect(result).to.contain(article1);
            expect(result).to.contain(article2);
            expect(mockArticleFind.getCalls()).to.be.length(1);
            mockArticleFind.restore();
        });

        it('Should return an empty list when there are no stored articles', async () => {
            // Given
            const mockArticleFind = sinon.stub(Article, 'find').returns({
                lean: sinon.stub().returns({
                    exec: sinon.stub().resolves([])
                })
            } as any);

            // When
            const result = await uut.fetch();

            // Then
            expect(result).to.be.length(0);
            expect(mockArticleFind.getCalls()).to.be.length(1);
            mockArticleFind.restore();
        });
    });

    describe('Find articles', () => {
        it('Should return the article when matching the supplied ID', async () => {
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
            const result = await uut.find(article.id);

            // Then
            expect(result).to.be.eq(article);
            expect(mockArticleFindById.getCalls()).to.be.length(1);
            mockArticleFindById.restore();
        });

        it('Should return null when not matching the supplied ID', async () => {
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
            const result = await uut.find(articleId);

            // Then
            expect(result).to.be.eq(null);
            expect(mockArticleFindById.getCalls()).to.be.length(1);
            mockArticleFindById.restore();
        });
    });

    describe('Create article', () => {
        it('Should create a new article when supplying an instance', async () => {
            // Given
            const article = getArticle();

            const mockArticleCreate = sinon.stub(Article, 'create');
            mockArticleCreate.resolves(article);

            // When
            const result = await uut.create(article);

            // Then
            expect(result).to.be.eq(article);
            expect(mockArticleCreate.getCalls()).to.be.length(1);
            mockArticleCreate.restore();
        });
    });

    describe('Update article', () => {
        it('Should return the updated article after updating an article when matching the supplied ID', async () => {
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
            const result = await uut.update(article.id, article);

            // Then
            expect(result).to.be.eq(article);
            expect(mockArticleFindByIdAndUpdate.getCalls()).to.be.length(1);
            mockArticleFindByIdAndUpdate.restore();
        });

        it('Should return null after not finding an article to update that matches the supplied ID', async () => {
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
            const result = await uut.update(article.id, article);

            // Then
            expect(result).to.be.eq(null);
            expect(mockArticleFindByIdAndUpdate.getCalls()).to.be.length(1);
            mockArticleFindByIdAndUpdate.restore();
        });
    });

    describe('Remove article', () => {
        it('Should return the removed article after deleting an article when matching the supplied ID', async () => {
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
            const result = await uut.remove(article.id);

            // Then
            expect(result).to.be.eq(article);
            expect(mockArticleFindOneAndDelete.getCalls()).to.be.length(1);
            mockArticleFindOneAndDelete.restore();
        });

        it('Should return null after not finding an article to delete that matches the supplied ID', async () => {
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
            const result = await uut.remove(articleId);

            // Then
            expect(result).to.be.eq(null);
            expect(mockArticleFindOneAndDelete.getCalls()).to.be.length(1);
            mockArticleFindOneAndDelete.restore();
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
