import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

vi.mock('../db', () => ({
    default: { one: vi.fn().mockResolvedValue({ '?column?': 1 }) },
}));

import { createApp } from '../src/app';
import db from '../db';

describe('GET /health', () => {
    it('returns 200 with ok status when the db is reachable', async () => {
        const app = createApp();
        const res = await request(app).get('/health');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ status: 'ok', service: 'vantage-api' });
    });

    it('returns 503 with unhealthy status when the db is unreachable', async () => {
        (db.one as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('connection refused'));

        const app = createApp();
        const res = await request(app).get('/health');

        expect(res.status).toBe(503);
        expect(res.body).toEqual({ status: 'unhealthy', error: 'db unreachable' });
    });
});
