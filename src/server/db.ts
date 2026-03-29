import pgPromise from 'pg-promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'newsapp',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
};

const pgp = pgPromise();
export const db = pgp(dbConfig);

db.connect()
    .then((obj) => {
        console.log(`[db] Connected to PostgreSQL at ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
        obj.done();
    })
    .catch((error) => {
        console.error('[db] Failed to connect to PostgreSQL:', error.message);
    });

export default db;
