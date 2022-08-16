import { Comment, IComment } from '../models';

class CommentService {
    static async findByArticleId(articleId: string): Promise<IComment[]> {
        return await Comment.find({ article: articleId }).lean().exec();
    }

    static async create(comment: IComment): Promise<IComment | null> {
        return await Comment.create(comment);
    }

    static async update(
        id: string,
        comment: IComment
    ): Promise<IComment | null> {
        return await Comment.findByIdAndUpdate(
            { _id: id },
            { $set: comment },
            { returnDocument: 'after' }
        ).exec();
    }

    static async remove(id: string): Promise<IComment | null> {
        return await Comment.findOneAndDelete({ _id: id }, {}).exec();
    }

    static async removeByArticleId(articleId: string): Promise<any> {
        return await Comment.deleteMany({ article: articleId }).exec();
    }
}

export default CommentService;
