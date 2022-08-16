import { Comment, IArticle, IComment } from '../models';
import sinon from 'sinon';
import uut from './comment';
import { expect } from 'chai';
import mongoose from 'mongoose';

describe('CommentService', () => {
    describe('Find comments by article ID', () => {
        it('Should return a comments list when there are comments linked to a given article ID', async () => {
            // Given
            const articleId = new mongoose.Types.ObjectId().toString();
            const comment1 = getComment(articleId);
            const comment2 = getComment(articleId);
            const commentsList: IComment[] = [comment1, comment2];

            const mockCommentFind = sinon.stub(Comment, 'find').returns({
                lean: sinon.stub().returns({
                    exec: sinon.stub().resolves(commentsList)
                })
            } as any);

            // When
            const result = await uut.findByArticleId(articleId);

            // Then
            expect(result).to.be.eq(commentsList);
            expect(result).to.contain(comment1);
            expect(result).to.contain(comment2);
            expect(mockCommentFind.getCalls()).to.be.length(1);
            mockCommentFind.restore();
        });

        it('Should return an empty list when there are no comments linked to a given article ID', async () => {
            // Given
            const articleId = new mongoose.Types.ObjectId().toString();
            const commentsList: IComment[] = [];

            const mockCommentFind = sinon.stub(Comment, 'find').returns({
                lean: sinon.stub().returns({
                    exec: sinon.stub().resolves(commentsList)
                })
            } as any);

            // When
            const result = await uut.findByArticleId(articleId);

            // Then
            expect(result).to.be.eq(commentsList);
            expect(result).to.be.length(0);
            expect(mockCommentFind.getCalls()).to.be.length(1);
            mockCommentFind.restore();
        });
    });

    describe('Create comment', () => {
        it('Should create a new comment when supplying an instance', async () => {
            // Given
            const comment = getComment();

            const mockCommentCreate = sinon.stub(Comment, 'create');
            mockCommentCreate.resolves(comment);

            // When
            const result = await uut.create(comment);

            // Then
            expect(result).to.be.eq(comment);
            expect(mockCommentCreate.getCalls()).to.be.length(1);
            mockCommentCreate.restore();
        });
    });

    describe('Update comment', () => {
        it('Should return the updated comment after updating a comment when matching the supplied ID', async () => {
            // Given
            const comment = getComment();

            const mockCommentFindByIdAndUpdate = sinon.stub(
                Comment,
                'findByIdAndUpdate'
            );
            mockCommentFindByIdAndUpdate.returns({
                exec: sinon.stub().resolves(comment)
            } as any);

            // When
            const result = await uut.update(comment.id, comment);

            // Then
            expect(result).to.be.eq(comment);
            expect(mockCommentFindByIdAndUpdate.getCalls()).to.be.length(1);
            mockCommentFindByIdAndUpdate.restore();
        });

        it('Should return null after not finding a comment to update that matches the supplied ID', async () => {
            // Given
            const comment = getComment();

            const mockCommentFindByIdAndUpdate = sinon.stub(
                Comment,
                'findByIdAndUpdate'
            );
            mockCommentFindByIdAndUpdate.returns({
                exec: sinon.stub().resolves(null)
            } as any);

            // When
            const result = await uut.update(comment.id, comment);

            // Then
            expect(result).to.be.eq(null);
            expect(mockCommentFindByIdAndUpdate.getCalls()).to.be.length(1);
            mockCommentFindByIdAndUpdate.restore();
        });
    });

    describe('Remove comment', () => {
        it('Should return the removed comment after deleting a comment when matching the supplied ID', async () => {
            // Given
            const comment = getComment();

            const mockCommentFindOneAndDelete = sinon.stub(
                Comment,
                'findOneAndDelete'
            );
            mockCommentFindOneAndDelete.returns({
                exec: sinon.stub().resolves(comment)
            } as any);

            // When
            const result = await uut.remove(comment.id);

            // Then
            expect(result).to.be.eq(comment);
            expect(mockCommentFindOneAndDelete.getCalls()).to.be.length(1);
            mockCommentFindOneAndDelete.restore();
        });

        it('Should return null after not finding a comment to delete that matches the supplied ID', async () => {
            // Given
            const commentId = new mongoose.Types.ObjectId().toString();
            const mockCommentFindOneAndDelete = sinon.stub(
                Comment,
                'findOneAndDelete'
            );
            mockCommentFindOneAndDelete.returns({
                exec: sinon.stub().resolves(null)
            } as any);

            // When
            const result = await uut.remove(commentId);

            // Then
            expect(result).to.be.eq(null);
            expect(mockCommentFindOneAndDelete.getCalls()).to.be.length(1);
            mockCommentFindOneAndDelete.restore();
        });
    });

    describe('Remove comment by article ID', () => {
        it('Should return the removed comment after deleting a comment when matching the supplied ID', async () => {
            // Given
            const articleId = new mongoose.Types.ObjectId().toString();
            const comment1 = getComment(articleId);
            const comment2 = getComment(articleId);
            const commentsList = [comment1, comment2];

            const mockCommentRemove = sinon.stub(Comment, 'deleteMany');
            mockCommentRemove.returns({
                exec: sinon.stub().resolves(commentsList)
            } as any);

            // When
            const result = await uut.removeByArticleId(articleId);

            // Then
            expect(result).to.be.eq(commentsList);
            expect(result).to.contain(comment1);
            expect(result).to.contain(comment2);
            expect(mockCommentRemove.getCalls()).to.be.length(1);
            mockCommentRemove.restore();
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
