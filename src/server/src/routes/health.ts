import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';
import db from '../../db';

const router = Router();

router.get(
    '/',
    asyncHandler(async (req, res) => {
        try {
            await db.one('SELECT 1');
            res.json({ status: 'ok', service: 'vantage-api' });
        } catch {
            res.status(503).json({ status: 'unhealthy', error: 'db unreachable' });
        }
    }),
);

export default router;
