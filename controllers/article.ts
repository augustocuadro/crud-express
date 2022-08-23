import { NextFunction, Request, Response } from 'express';
import { IArticle } from '../models';
import ArticleService from '../services/article';
import RequestError from '../models/requestError';
import NotFoundError from '../models/notFoundError';
import CommentService from '../services/comment';

class ArticleController {
    static async fetch(req: Request, res: Response, next: NextFunction) {
        try {
            const articles = await ArticleService.fetch();
            res.json(articles);
        } catch (err: unknown) {
            next(err);
        }
    }

    static async find(req: Request, res: Response, next: NextFunction) {
        try {
            const article = await ArticleService.find(req.params.id);
            if (!article) {
                return next(
                    new NotFoundError('Provided article does not exists')
                );
            }

            res.json(article);
        } catch (err: unknown) {
            next(err);
        }
    }

    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const article = await ArticleService.create(req.body as IArticle);
            res.status(201).json(article);
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

            const result = await ArticleService.update(req.params.id, req.body);
            if (!result) {
                return next(
                    new NotFoundError('Provided article does not exists')
                );
            }

            res.json(result);
        } catch (err: unknown) {
            next(err);
        }
    }

    static async remove(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await ArticleService.remove(req.params.id);
            if (!result) {
                return next(
                    new NotFoundError(
                        'There is no article with the provided ID'
                    )
                );
            }
            const comments = await CommentService.removeByArticleId(result.id);

            res.json({
                article: result,
                comments: comments
            });
        } catch (err: unknown) {
            next(err);
        }
    }
}

export default ArticleController;
