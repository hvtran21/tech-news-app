import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';
import { validate } from '../middleware/validate';
import { cleanupBody, type CleanupBody } from '../schemas/requests';
import * as articleService from '../services/articleService';
import * as refreshService from '../services/refreshService';

const router = Router();

/**
 * @openapi
 * /api/admin/refresh:
 *   post:
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
 */
router.post(
    '/refresh',
    asyncHandler(async (req, res) => {
        const errors = await refreshService.fetchAllSources();
        res.json({
            ok: true,
            message: errors > 0 ? `Fetched articles with ${errors} source error(s).` : 'Fetching articles successful.',
        });
    }),
);

/**
 * @openapi
 * /api/admin/cleanup:
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
 *                 removed:
 *                   type: integer
 */
router.post(
    '/cleanup',
    validate(cleanupBody, 'body'),
    asyncHandler(async (req, res) => {
        const { days } = req.body as CleanupBody;
        const removed = await articleService.deleteOldArticles(days);
        res.json({ ok: true, message: 'Removing articles successful.', removed });
    }),
);

export default router;
