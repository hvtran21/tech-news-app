import pgPromise from 'pg-promise';
import { env } from './src/config/env';
import logger from './src/lib/logger';

const dbConfig = {
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
};

const pgp = pgPromise();
export const db = pgp(dbConfig);

db.connect()
    .then((obj) => {
        logger.info(`Connected to PostgreSQL at ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
        obj.done();
    })
    .catch((error) => {
        logger.error({ err: error }, 'Failed to connect to PostgreSQL');
    });

export default db;
