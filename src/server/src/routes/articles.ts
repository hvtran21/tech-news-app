import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';
import { validate } from '../middleware/validate';
import {
    listArticlesQuery,
    type ListArticlesQuery,
    searchArticlesQuery,
    type SearchArticlesQuery,
} from '../schemas/requests';
import { BadRequestError } from '../lib/errors';
import { encodeCursor, decodeCursor } from '../lib/cursor';
import type { Cursor } from '../repositories/articleRepo';
import * as articleService from '../services/articleService';
import * as refreshService from '../services/refreshService';
import logger from '../lib/logger';

const router = Router();

router.get(
    '/',
    validate(listArticlesQuery, 'query'),
    asyncHandler(async (req, res) => {
        const { genre, category, limit, cursor: cursorToken } = req.query as unknown as ListArticlesQuery;

        // CSV+cursor is an incompatibility, not a decoding issue — check before decode.
        if (cursorToken && genre && genre.includes(',')) {
            const err = new BadRequestError(
                'Cursor pagination requires a single genre or category, not a CSV',
            );
            err.code = 'CursorNotSupported';
            throw err;
        }

        let cursor: Cursor | undefined;
        if (cursorToken) {
            const decoded = decodeCursor(cursorToken);
            if (!decoded) {
                const err = new BadRequestError('Invalid cursor');
                err.code = 'InvalidCursor';
                throw err;
            }
            cursor = decoded;
        }

        if (genre) {
            const genreArray = genre.split(',');
            logger.info(`GetArticles genres=${genreArray.join(', ')} limit=${limit}`);

            for (const g of genreArray) {
                if (!refreshService.findGenreKey(g)) {
                    const err = new BadRequestError(`Invalid genre: ${g}`);
                    err.code = 'InvalidGenre';
                    throw err;
                }
            }

            await Promise.all(
                genreArray.map((g) =>
                    refreshService.refreshIfStale(g, undefined).catch((err) => {
                        logger.error({ err, genre: g }, 'Background refresh failed');
                    }),
                ),
            );

            const articles = await articleService.listByGenres(genre, limit, cursor);
            logger.info({ count: articles.length }, 'Returning articles');
            res.json({ articles, nextCursor: nextCursorFor(articles, limit) });
            return;
        }

        logger.info(`GetArticles category=${category}`);

        try {
            await refreshService.refreshIfStale(undefined, category);
        } catch (err) {
            logger.error({ err, category }, 'Background refresh failed');
        }

        const articles = await articleService.listByCategory(category as string, limit, cursor);
        logger.info({ count: articles.length }, 'Returning articles');
        res.json({ articles, nextCursor: nextCursorFor(articles, limit) });
    }),
);

router.get(
    '/search',
    validate(searchArticlesQuery, 'query'),
    asyncHandler(async (req, res) => {
        const { q, limit } = req.query as unknown as SearchArticlesQuery;
        const articles = await articleService.search(q, limit);
        res.json({ articles });
    }),
);

function nextCursorFor(articles: { published_at: Date; id: string }[], limit: number): string | null {
    if (articles.length !== limit) return null;
    const last = articles[articles.length - 1];
    return encodeCursor({ t: new Date(last.published_at).toISOString(), i: last.id });
}

export default router;
