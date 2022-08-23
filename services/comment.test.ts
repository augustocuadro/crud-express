import { Comment, IArticle, IComment } from '../models';
import sinon from 'sinon';
import CommentService from './comment';
import { expect } from 'chai';
import mongoose from 'mongoose';

describe('when consuming CommentService', () => {
    describe('and retrieving comments by article ID', () => {
        describe('and there are comments linked to a given article ID', () => {
            it('should return a comments list', async () => {
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
                const result = await CommentService.findByArticleId(articleId);

                // Then
                expect(result).to.be.eq(commentsList);
                expect(result).to.contain(comment1);
                expect(result).to.contain(comment2);
                expect(mockCommentFind.getCalls()).to.be.length(1);
                mockCommentFind.restore();
            });
        });

        describe('and there are no comments linked to a given article ID', () => {
            it('should return an empty list', async () => {
                // Given
                const articleId = new mongoose.Types.ObjectId().toString();
                const commentsList: IComment[] = [];

                const mockCommentFind = sinon.stub(Comment, 'find').returns({
                    lean: sinon.stub().returns({
                        exec: sinon.stub().resolves(commentsList)
                    })
                } as any);

                // When
                const result = await CommentService.findByArticleId(articleId);

                // Then
                expect(result).to.be.eq(commentsList);
                expect(result).to.be.length(0);
                expect(mockCommentFind.getCalls()).to.be.length(1);
                mockCommentFind.restore();
            });
        });
    });

    describe('and creating a new comment', () => {
        it('should create a new comment', async () => {
            // Given
            const comment = getComment();

            const mockCommentCreate = sinon.stub(Comment, 'create');
            mockCommentCreate.resolves(comment);

            // When
            const result = await CommentService.create(comment);

            // Then
            expect(result).to.be.eq(comment);
            expect(mockCommentCreate.getCalls()).to.be.length(1);
            mockCommentCreate.restore();
        });
    });

    describe('and updating an existing comment', () => {
        describe('and matching the supplied ID', () => {
            it('should return the updated comment', async () => {
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
                const result = await CommentService.update(comment.id, comment);

                // Then
                expect(result).to.be.eq(comment);
                expect(mockCommentFindByIdAndUpdate.getCalls()).to.be.length(1);
                mockCommentFindByIdAndUpdate.restore();
            });
        });

        describe('and not matching the supplied ID', () => {
            it('should return null', async () => {
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
                const result = await CommentService.update(comment.id, comment);

                // Then
                expect(result).to.be.eq(null);
                expect(mockCommentFindByIdAndUpdate.getCalls()).to.be.length(1);
                mockCommentFindByIdAndUpdate.restore();
            });
        });
    });

    describe('and deleting a comment', () => {
        describe('and comment is successfully deleted', () => {
            it('should return the removed comment', async () => {
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
                const result = await CommentService.remove(comment.id);

                // Then
                expect(result).to.be.eq(comment);
                expect(mockCommentFindOneAndDelete.getCalls()).to.be.length(1);
                mockCommentFindOneAndDelete.restore();
            });
        });

        describe('and comment does not exist', () => {
            it('should return null', async () => {
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
                const result = await CommentService.remove(commentId);

                // Then
                expect(result).to.be.eq(null);
                expect(mockCommentFindOneAndDelete.getCalls()).to.be.length(1);
                mockCommentFindOneAndDelete.restore();
            });
        });

        describe('and deleting by article ID', () => {
            it('should return the removed comment', async () => {
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
                const result = await CommentService.removeByArticleId(
                    articleId
                );

                // Then
                expect(result).to.be.eq(commentsList);
                expect(result).to.contain(comment1);
                expect(result).to.contain(comment2);
                expect(mockCommentRemove.getCalls()).to.be.length(1);
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
