import { NextFunction, Request, Response } from 'express';
import CommentService from '../services/comment';
import ArticleService from '../services/article';
import RequestError from '../models/requestError';
import NotFoundError from '../models/notFoundError';

class CommentController {
    static async find(req: Request, res: Response, next: NextFunction) {
        try {
            const articleId = req.query.article as string;
            if (!articleId) {
                return next(new RequestError('ArticleId must be provided'));
            }

            res.json(await CommentService.findByArticleId(articleId));
        } catch (err: unknown) {
            next(err);
        }
    }

    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const articleId = req.body.article;
            if (!articleId) {
                return next(new RequestError('Article must be provided'));
            }

            const article = await ArticleService.find(req.body.article);
            if (!article) {
                return next(
                    new NotFoundError('Provided article does not exists')
                );
            }

            const comment = await CommentService.create(req.body);
            res.status(201).json(comment);
        } catch (err: unknown) {
            next(err);
        }
    }

    static async update(req: Request, res: Response, next: NextFunction) {
        try {
            if (req.body.id && req.params.id !== req.body.id) {
                return next(
                    new RequestError(
                        'Route ID must match with the request body ID'
                    )
                );
            }

            const articleId = req.body.article;
            if (!articleId) {
                return next(new RequestError('Article must be provided'));
            }

            const article = await ArticleService.find(req.body.article);
            if (!article) {
                return next(
                    new NotFoundError('Provided article does not exists')
                );
            }

            const result = await CommentService.update(req.params.id, req.body);
            if (!result) {
                return next(
                    new NotFoundError('Provided comment does not exists')
                );
            }

            res.json(result);
        } catch (err: unknown) {
            next(err);
        }
    }

    static async remove(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await CommentService.remove(req.params.id);
            if (!result) {
                return next(
                    new NotFoundError(
                        'There is no comment with the provided ID'
                    )
                );
            }

            res.json(result);
        } catch (err: unknown) {
            next(err);
        }
    }
}

export default CommentController;
