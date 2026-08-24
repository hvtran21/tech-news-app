import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../swagger';
import { articleTableDefinition, fetchLogTableDefinition } from '../models';
import db from '../db';
import { env } from './config/env';
import logger from './lib/logger';
import { asyncHandler } from './lib/asyncHandler';
import requestLogger from './middleware/requestLogger';
import errorHandler from './middleware/errorHandler';
import * as articleService from './services/articleService';
import * as refreshService from './services/refreshService';

async function initDatabase() {
    try {
        await db.none(articleTableDefinition);
        await db.none(fetchLogTableDefinition);
        logger.info('Database initialized');
    } catch (error) {
        logger.error({ err: error }, 'Failed to initialize database');
        throw error;
    }
}

const startServer = () => {
    const app = express();
    app.use(express.json());
    app.use(requestLogger);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    const port = env.PORT;

    /**
     * @openapi
     * /api/RemoveOldArticles:
     *   post:
     *     summary: Remove old articles from the database
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               days:
     *                 type: integer
     *                 description: Number of days to keep (default 7)
     *                 example: 7
     *     responses:
     *       200:
     *         description: Articles removed successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                 message:
     *                   type: string
     *       500:
     *         description: Internal server error
     */
    app.post(
        '/api/RemoveOldArticles',
        asyncHandler(async (req, res) => {
            const days = req.body?.days as number | undefined;

            if (days !== undefined && (typeof days !== 'number' || days < 1 || days > 365)) {
                res.status(400).json({ ok: false, message: 'days must be a number between 1 and 365.' });
                return;
            }

            const removed = await articleService.deleteOldArticles(days ?? 7);
            res.json({ ok: true, message: 'Removing articles successful.', removed });
        }),
    );

    /**
     * @openapi
     * /api/FetchArticles:
     *   get:
     *     summary: Force-fetch articles from NewsAPI for all genres and categories (ignores staleness)
     *     responses:
     *       200:
     *         description: Articles fetched and stored successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                 message:
     *                   type: string
     *       500:
     *         description: Internal server error
     */
    app.get(
        '/api/FetchArticles',
        asyncHandler(async (req, res) => {
            const errors = await refreshService.fetchAllSources();
            res.json({
                ok: true,
                message:
                    errors > 0
                        ? `Fetched articles with ${errors} source error(s).`
                        : 'Fetching articles successful.',
            });
        }),
    );

    /**
     * @openapi
     * /api/GetArticles:
     *   post:
     *     summary: Get articles by genre or category (auto-fetches from NewsAPI if stale)
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               genre:
     *                 type: object
     *                 properties:
     *                   genre:
     *                     type: string
     *                     description: Comma-separated genre values
     *                     example: "Artificial Intelligence,Gaming"
     *               category:
     *                 type: object
     *                 properties:
     *                   cat:
     *                     type: string
     *                     description: Category value
     *                     example: "Technology"
     *               articleRetrievalLimit:
     *                 type: object
     *                 properties:
     *                   limit:
     *                     type: integer
     *                     description: Max articles per genre
     *                     example: 10
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
     *                     properties:
     *                       id:
     *                         type: string
     *                         format: uuid
     *                       genre:
     *                         type: string
     *                       category:
     *                         type: string
     *                       source:
     *                         type: string
     *                       author:
     *                         type: string
     *                       title:
     *                         type: string
     *                       description:
     *                         type: string
     *                       url:
     *                         type: string
     *                       url_to_image:
     *                         type: string
     *                       published_at:
     *                         type: string
     *                         format: date
     *                       content:
     *                         type: string
     */
    app.post(
        '/api/GetArticles',
        asyncHandler(async (req, res) => {
            const genres = (req.body.genre?.genre ?? req.body.genre ?? '') as string;
            const category = (req.body.category?.cat ?? req.body.category ?? '') as string;
            const rawLimit = req.body.articleRetrievalLimit?.limit ?? req.body.limit ?? 100;
            const limit = Math.min(Math.max(Number(rawLimit) || 100, 1), 500);

            if (genres && genres.length > 0) {
                const genreArray = genres.split(',');
                logger.info(`GetArticles genres=${genreArray.join(', ')} limit=${limit}`);

                for (const g of genreArray) {
                    if (!refreshService.findGenreKey(g)) {
                        res.status(400).json({ error: `Invalid genre: ${g}` });
                        return;
                    }
                    try {
                        await refreshService.refreshIfStale(g, undefined);
                    } catch (err) {
                        logger.error({ err, genre: g }, 'Background refresh failed');
                    }
                }

                const articles = await articleService.listByGenres(genres, limit);
                logger.info({ count: articles.length }, 'Returning articles');
                res.json({ articles });
                return;
            }

            if (category && category.length > 0) {
                logger.info(`GetArticles category=${category}`);

                try {
                    await refreshService.refreshIfStale(undefined, category);
                } catch (err) {
                    logger.error({ err, category }, 'Background refresh failed');
                }

                const articles = await articleService.listByCategory(category, limit);
                logger.info({ count: articles.length }, 'Returning articles');
                res.json({ articles });
                return;
            }

            res.status(400).json({ error: 'Missing genre or category parameter.' });
        }),
    );

    app.use(errorHandler);

    app.listen(port, () => {
        logger.info(`Listening on port ${port}`);
    });
};

// Startup: init DB first, then start server
initDatabase()
    .then(() => startServer())
    .catch((error) => {
        logger.error({ err: error }, 'Startup failed, exiting');
        process.exit(1);
    });
