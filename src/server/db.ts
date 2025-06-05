import pgPromise from 'pg-promise'

const cn = {
    host: 'localhost',
    port: 5432,
    database: 'newsapp',
    user: 'dev',
    password: 'dev',
}

const pgp = pgPromise();

// connect to database
export const db = pgp(cn);

export default db;