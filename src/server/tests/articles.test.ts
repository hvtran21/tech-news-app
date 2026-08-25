import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

vi.mock('../src/services/articleService', () => ({
    listByGenres: vi.fn().mockResolvedValue([{ id: '1', title: 'x', genre: 'Artificial Intelligence' }]),
    listByCategory: vi.fn().mockResolvedValue([]),
    deleteOldArticles: vi.fn().mockResolvedValue(0),
}));

vi.mock('../src/services/refreshService', () => ({
    findGenreKey: vi.fn((g: string) => (g === 'Artificial Intelligence' ? 'AI' : undefined)),
    refreshIfStale: vi.fn().mockResolvedValue(true),
    fetchAllSources: vi.fn().mockResolvedValue(0),
}));

vi.mock('../db', () => ({
    default: { one: vi.fn().mockResolvedValue({ '?column?': 1 }) },
}));

import { createApp } from '../src/app';

describe('GET /api/articles', () => {
    it('returns articles for a valid genre', async () => {
        const app = createApp();
        const res = await request(app).get('/api/articles?genre=Artificial%20Intelligence&limit=3');

        expect(res.status).toBe(200);
        expect(res.body.articles).toEqual([{ id: '1', title: 'x', genre: 'Artificial Intelligence' }]);
        expect(res.body.nextCursor).toBeNull();
    });

    it('accepts a cursor for a single-genre query', async () => {
        const app = createApp();
        const cursor = Buffer.from(JSON.stringify({ t: '2026-01-01T00:00:00.000Z', i: '1' })).toString(
            'base64url',
        );
        const res = await request(app).get(
            `/api/articles?genre=Artificial%20Intelligence&limit=3&cursor=${cursor}`,
        );

        expect(res.status).toBe(200);
        expect(res.body.articles).toEqual([{ id: '1', title: 'x', genre: 'Artificial Intelligence' }]);
        expect(res.body.nextCursor).toBeNull();
    });

    it('rejects a cursor combined with a CSV genre list', async () => {
        const app = createApp();
        const cursor = Buffer.from(JSON.stringify({ t: '2026-01-01T00:00:00.000Z', i: '1' })).toString(
            'base64url',
        );
        const res = await request(app).get(
            `/api/articles?genre=Artificial%20Intelligence,Apple&limit=3&cursor=${cursor}`,
        );

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('CursorNotSupported');
    });

    it('rejects a malformed cursor', async () => {
        const app = createApp();
        const res = await request(app).get(
            '/api/articles?genre=Artificial%20Intelligence&limit=3&cursor=not-valid-base64url-json',
        );

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('InvalidCursor');
    });

    it('returns articles for a valid category', async () => {
        const app = createApp();
        const res = await request(app).get('/api/articles?category=Technology&limit=2');

        expect(res.status).toBe(200);
        expect(res.body.articles).toEqual([]);
    });

    it('rejects a request with neither genre nor category', async () => {
        const app = createApp();
        const res = await request(app).get('/api/articles');

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('ValidationError');
        expect(JSON.stringify(res.body)).toContain('genre or category required');
    });

    it('rejects an unknown genre', async () => {
        const app = createApp();
        const res = await request(app).get('/api/articles?genre=NotAGenre&limit=1');

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('InvalidGenre');
    });

    it('rejects a limit above the allowed maximum', async () => {
        const app = createApp();
        const res = await request(app).get('/api/articles?genre=Artificial%20Intelligence&limit=9999');

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('ValidationError');
    });
});

describe('POST /api/admin/cleanup', () => {
    it('rejects a days value above the allowed maximum', async () => {
        const app = createApp();
        const res = await request(app)
            .post('/api/admin/cleanup')
            .set('x-admin-token', 'test-token-min-16-chars')
            .send({ days: 999 });

        expect(res.status).toBe(400);
    });

    it('accepts a valid days value', async () => {
        const app = createApp();
        const res = await request(app)
            .post('/api/admin/cleanup')
            .set('x-admin-token', 'test-token-min-16-chars')
            .send({ days: 30 });

        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
    });

    it('rejects a request with no admin token', async () => {
        const app = createApp();
        const res = await request(app).post('/api/admin/cleanup').send({ days: 30 });

        expect(res.status).toBe(401);
        expect(res.body.error).toBe('Unauthorized');
    });
});
