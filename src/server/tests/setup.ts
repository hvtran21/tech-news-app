// Runs before any test file (and before its imports touch config/env.ts),
// so the required env vars must exist before the process ever calls
// envSchema.safeParse(process.env). Belt-and-suspenders with the
// NODE_ENV=test set by the npm scripts themselves.
process.env.NODE_ENV = 'test';
process.env.NEWS_API_KEY = 'test';
process.env.DB_NAME = 'test';
process.env.DB_USER = 'test';
process.env.DB_PASSWORD = 'test';
process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test';
process.env.ADMIN_TOKEN = 'test-token-min-16-chars';
