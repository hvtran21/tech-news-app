import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';
import db from '../../db';

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check (verifies PostgreSQL connectivity)
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Database unreachable
 */
router.get(
    '/',
    asyncHandler(async (req, res) => {
        try {
            await db.one('SELECT 1');
            res.json({ status: 'ok', service: 'tech-news-server' });
        } catch {
            res.status(503).json({ status: 'unhealthy', error: 'db unreachable' });
        }
    }),
);

export default router;
