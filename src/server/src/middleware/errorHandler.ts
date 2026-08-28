import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../lib/errors';
import logger from '../lib/logger';

export const errorHandler = (
    err: unknown,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction,
) => {
    if (err instanceof ZodError) {
        res.status(400).json({ error: 'ValidationError', details: err.issues });
        return;
    }

    if (err instanceof AppError) {
        res.status(err.status).json({ error: err.code, message: err.message });
        return;
    }

    logger.error({ err, method: req.method, path: req.path }, 'Unhandled error');
    res.status(500).json({ error: 'InternalError' });
};

export default errorHandler;
