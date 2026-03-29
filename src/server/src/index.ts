import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../swagger';
import { articleTableDefinition } from '../models';
import fetchArticles from '../newsapi';
import techGenres, { categories } from '../constants';
import db from '../db';

async function initDatabase() {
    try {
        await db.none(articleTableDefinition);
        console.log('[db] Database initialized');
    } catch (error) {
        console.error('[db] Failed to initialize database:', error);
        throw error;
    }
}

async function fetchAllSources() {
    let totalErrors = 0;

    for (const genre of Object.values(techGenres)) {
        try {
            await fetchArticles(genre, undefined);
        } catch (error) {
            console.error(`[fetch] Failed to fetch genre "${genre}":`, error);
            totalErrors++;
        }
    }

    for (const category of Object.values(categories)) {
        try {
            await fetchArticles(undefined, category);
        } catch (error) {
            console.error(`[fetch] Failed to fetch category "${category}":`, error);
            totalErrors++;
        }
    }

    if (totalErrors > 0) {
        console.warn(`[fetch] Completed with ${totalErrors} error(s)`);
    }

    return totalErrors;
}

function findGenreKey(genre: string) {
    return Object.keys(techGenres).find((k) => {
        return techGenres[k as keyof typeof techGenres] === genre;
    });
}

const formatDateUTC = (d: Date): string => {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

async function removeOldArticles(days?: number): Promise<number> {
    const retentionDays: number = days ?? 7;

    try {
        const now = new Date();
        const cutoffDate = formatDateUTC(
            new Date(now.getTime() - retentionDays * 24 * 60 * 60 * 1000),
        );

        const result = await db.result(
            'DELETE FROM articles WHERE published_at <= $1',
            cutoffDate,
        );
        console.log(`[cleanup] Removed ${result.rowCount} article(s) older than ${retentionDays} days`);
        return 0;
    } catch (error) {
        console.error('[cleanup] Error removing articles:', error);
        return -1;
    }
}

const startServer = () => {
    const app = express();
    app.use(express.json());
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    const port = process.env.PORT || 8000;

    // Request logging
    app.use((req, res, next) => {
        const start = Date.now();
        res.on('finish', () => {
            const duration = Date.now() - start;
            console.log(`[http] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
        });
        next();
    });

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
    app.post('/api/RemoveOldArticles', async (req, res) => {
        const days = req.body?.days as number;

        if (days !== undefined && (typeof days !== 'number' || days < 1 || days > 365)) {
            res.status(400).json({ ok: false, message: 'days must be a number between 1 and 365.' });
            return;
        }

        try {
            const result = await removeOldArticles(days);
            if (result !== 0) {
                res.status(500).json({
                    ok: false,
                    message: 'Error occurred while removing articles.',
                });
            } else {
                res.status(200).json({
                    ok: true,
                    message: 'Removing articles successful.',
                });
            }
        } catch (error) {
            console.error('[api] RemoveOldArticles error:', error);
            res.status(500).json({ ok: false, message: 'Internal server error.' });
        }
    });

    /**
     * @openapi
     * /api/FetchArticles:
     *   get:
     *     summary: Fetch articles from NewsAPI for all genres and categories
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
    app.get('/api/FetchArticles', async (req, res) => {
        try {
            const errors = await fetchAllSources();
            if (errors > 0) {
                res.status(200).json({
                    ok: true,
                    message: `Fetched articles with ${errors} source error(s).`,
                });
                return;
            }
            res.status(200).json({
                ok: true,
                message: 'Fetching articles successful.',
            });
        } catch (error) {
            console.error('[api] FetchArticles error:', error);
            res.status(500).json({ ok: false, message: 'Internal server error.' });
        }
    });

    /**
     * @openapi
     * /api/GetArticles:
     *   post:
     *     summary: Get articles by genre or category
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
    app.post('/api/GetArticles', async (req, res) => {
        const genres = (req.body.genre?.genre ?? req.body.genre ?? '') as string;
        const category = (req.body.category?.cat ?? req.body.category ?? '') as string;
        const rawLimit = req.body.articleRetrievalLimit?.limit ?? req.body.limit ?? 100;
        const limit = Math.min(Math.max(Number(rawLimit) || 100, 1), 500);

        try {
            if (genres && genres.length > 0) {
                const genreArray = genres.split(',');
                console.log(`[api] GetArticles genres=${genreArray.join(', ')} limit=${limit}`);

                const data = await db.tx((t) => {
                    const queries = genreArray.map((genre) => {
                        const genreKey = findGenreKey(genre);
                        if (!genreKey) {
                            throw new Error(`Genre not in ENUM, got: ${genre}`);
                        }
                        return t.any('SELECT * FROM articles WHERE genre = $1 LIMIT $2', [
                            genre,
                            limit,
                        ]);
                    });
                    return t.batch(queries);
                });

                const articles = data.flat();
                console.log(`[api] Returning ${articles.length} article(s)`);
                res.json({ articles });
            } else if (category && category.length > 0) {
                console.log(`[api] GetArticles category=${category}`);
                const data = await db.any(
                    'SELECT * FROM articles WHERE category = $1 LIMIT $2',
                    [category, limit],
                );
                const articles = data.flat();
                console.log(`[api] Returning ${articles.length} article(s)`);
                res.json({ articles });
            } else {
                res.status(400).json({ error: 'Missing genre or category parameter.' });
            }
        } catch (error) {
            console.error('[api] Error retrieving articles:', error);
            res.status(500).json({ error: 'Internal server error.' });
        }
    });

    app.listen(port, () => {
        console.log(`[server] Listening on port ${port}`);
    });
};

// Startup: init DB first, then start server
initDatabase()
    .then(() => startServer())
    .catch((error) => {
        console.error('[server] Startup failed, exiting:', error);
        process.exit(1);
    });
