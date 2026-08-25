import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';
import { validate } from '../middleware/validate';
import { listArticlesQuery, type ListArticlesQuery } from '../schemas/requests';
import { BadRequestError } from '../lib/errors';
import * as articleService from '../services/articleService';
import * as refreshService from '../services/refreshService';
import logger from '../lib/logger';

const router = Router();

/**
 * @openapi
 * /api/articles:
 *   get:
 *     summary: Get articles by genre or category (auto-fetches from NewsAPI if stale)
 *     parameters:
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Comma-separated genre values
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *     responses:
 *       200:
 *         description: Articles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 articles:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Invalid or missing genre/category
 */
router.get(
    '/',
    validate(listArticlesQuery, 'query'),
    asyncHandler(async (req, res) => {
        const { genre, category, limit } = req.query as unknown as ListArticlesQuery;

        if (genre) {
            const genreArray = genre.split(',');
            logger.info(`GetArticles genres=${genreArray.join(', ')} limit=${limit}`);

            for (const g of genreArray) {
                if (!refreshService.findGenreKey(g)) {
                    const err = new BadRequestError(`Invalid genre: ${g}`);
                    err.code = 'InvalidGenre';
                    throw err;
                }
                try {
                    await refreshService.refreshIfStale(g, undefined);
                } catch (err) {
                    logger.error({ err, genre: g }, 'Background refresh failed');
                }
            }

            const articles = await articleService.listByGenres(genre, limit);
            logger.info({ count: articles.length }, 'Returning articles');
            res.json({ articles });
            return;
        }

        logger.info(`GetArticles category=${category}`);

        try {
            await refreshService.refreshIfStale(undefined, category);
        } catch (err) {
            logger.error({ err, category }, 'Background refresh failed');
        }

        const articles = await articleService.listByCategory(category as string, limit);
        logger.info({ count: articles.length }, 'Returning articles');
        res.json({ articles });
    }),
);

export default router;
