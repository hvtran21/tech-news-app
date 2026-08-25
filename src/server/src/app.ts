import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../swagger';
import { env } from './config/env';
import requestLogger from './middleware/requestLogger';
import errorHandler from './middleware/errorHandler';
import adminAuth from './middleware/adminAuth';
import articlesRouter from './routes/articles';
import adminRouter from './routes/admin';
import healthRouter from './routes/health';

const isTestEnv = env.NODE_ENV === 'test';

// General API limiter: generous ceiling for normal client traffic.
const apiLimiter = rateLimit({
    windowMs: 60_000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => isTestEnv,
});

// Tighter limiter for admin endpoints (refresh/cleanup are expensive + sensitive).
const adminLimiter = rateLimit({
    windowMs: 60_000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => isTestEnv,
});

export function createApp(): Express {
    const app = express();

    app.use(express.json());
    app.use(requestLogger);
    app.use(cors());
    // Helmet's default CSP blocks swagger-ui's inline scripts/styles at /api-docs,
    // so CSP is disabled here rather than hand-rolling directives for swagger-ui.
    app.use(helmet({ contentSecurityPolicy: false }));

    app.use('/api', apiLimiter);
    app.use('/api/admin', adminLimiter);
    app.use('/api/admin', adminAuth);

    app.use('/api/articles', articlesRouter);
    app.use('/api/admin', adminRouter);
    app.use('/health', healthRouter);

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    app.use(errorHandler);

    return app;
}

export default createApp;
