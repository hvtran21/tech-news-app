import { createApp } from './app';
import { env } from './config/env';
import logger from './lib/logger';
import { closeDb } from '../db';

const startServer = () => {
    const app = createApp();
    const port = env.PORT;

    logger.info('Schema managed by node-pg-migrate; run `npm run migrate:up` to apply pending migrations.');

    const server = app.listen(port, () => {
        logger.info(`Listening on port ${port}`);
    });

    for (const signal of ['SIGTERM', 'SIGINT'] as const) {
        process.on(signal, () => {
            logger.info({ signal }, 'Shutting down');
            server.close(() => {
                try {
                    closeDb();
                    process.exit(0);
                } catch {
                    process.exit(1);
                }
            });
            setTimeout(() => process.exit(1), 10_000).unref();
        });
    }
};

// Startup: schema is managed externally via `npm run migrate:up` (node-pg-migrate).
try {
    startServer();
} catch (error) {
    logger.error({ err: error }, 'Startup failed, exiting');
    process.exit(1);
}
