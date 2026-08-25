import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../swagger';
import { env } from './config/env';
import logger from './lib/logger';
import requestLogger from './middleware/requestLogger';
import errorHandler from './middleware/errorHandler';
import articlesRouter from './routes/articles';
import adminRouter from './routes/admin';
import healthRouter from './routes/health';

const startServer = () => {
    const app = express();
    app.use(express.json());
    app.use(requestLogger);
    logger.info('Schema managed by node-pg-migrate; run `npm run migrate:up` to apply pending migrations.');
    const port = env.PORT;

    app.use('/api/articles', articlesRouter);
    app.use('/api/admin', adminRouter);
    app.use('/health', healthRouter);

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    app.use(errorHandler);

    app.listen(port, () => {
        logger.info(`Listening on port ${port}`);
    });
};

// Startup: schema is managed externally via `npm run migrate:up` (node-pg-migrate).
try {
    startServer();
} catch (error) {
    logger.error({ err: error }, 'Startup failed, exiting');
    process.exit(1);
}
