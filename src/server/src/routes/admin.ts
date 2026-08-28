import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler';
import { validate } from '../middleware/validate';
import { cleanupBody, type CleanupBody } from '../schemas/requests';
import * as articleService from '../services/articleService';
import * as refreshService from '../services/refreshService';

const router = Router();

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
