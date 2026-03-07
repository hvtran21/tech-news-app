import pgPromise from 'pg-promise';
import dotenv from 'dotenv';

dotenv.config();

const cn = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'newsapp',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
};

const pgp = pgPromise();

// connect to database
export const db = pgp(cn);

export default db;
