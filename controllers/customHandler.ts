import { NextFunction, Request, Response } from 'express';
import RequestError from '../models/requestError';
import mongoose from 'mongoose';
import NotFoundError from '../models/notFoundError';

class CustomHandler {
    static async errorHandler(
        err: Error,
        req: Request,
        res: Response,
        _: NextFunction
    ) {
        if (
            err instanceof RequestError ||
            err instanceof mongoose.Error.ValidationError ||
            err instanceof mongoose.Error.CastError
        ) {
            return res.status(400).json({ message: err.message });
        }
        if (err instanceof NotFoundError) {
            return res.status(404).json({ message: err.message });
        }
        res.status(500).json({ message: 'Unexpected error' });
    }

    static async notFoundHandler(req: Request, res: Response, _: NextFunction) {
        res.status(404).json({ message: 'Resource not found' });
    }
}

export default CustomHandler;
