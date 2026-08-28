import type { RequestHandler } from 'express';
import { env } from '../config/env';
import { AppError } from '../lib/errors';

export const adminAuth: RequestHandler = (req, _res, next) => {
    const token = req.header('x-admin-token');
    if (!token || token !== env.ADMIN_TOKEN) {
        return next(new AppError(401, 'Missing or invalid admin token', 'Unauthorized'));
    }
    next();
};

export default adminAuth;
