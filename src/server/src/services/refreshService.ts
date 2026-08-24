import techGenres, { categories } from '../../constants';
import * as articleRepo from '../repositories/articleRepo';
import * as fetchLogRepo from '../repositories/fetchLogRepo';
import { fetchFromNewsApi } from './newsapi/client';
import logger from '../lib/logger';

export const STALE_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes

// Fetches a single genre or category from NewsAPI if it's stale, then updates the fetch log
export async function refreshIfStale(genre?: string, category?: string): Promise<boolean> {
    const sourceKey = genre ?? category;
    if (!sourceKey) return false;

    const stale = await fetchLogRepo.isStale(sourceKey, STALE_THRESHOLD_MS);
    if (!stale) return false;

    logger.info(`"${sourceKey}" is stale, fetching from NewsAPI`);
    const rows = await fetchFromNewsApi(genre, category);
    await articleRepo.insertArticles(rows);
    await fetchLogRepo.updateFetchTime(sourceKey);
    return true;
}

export async function fetchAllSources(): Promise<number> {
    let totalErrors = 0;

    for (const genre of Object.values(techGenres)) {
        try {
            const rows = await fetchFromNewsApi(genre, undefined);
            await articleRepo.insertArticles(rows);
            await fetchLogRepo.updateFetchTime(genre);
        } catch (error) {
            logger.error({ err: error }, `Failed to fetch genre "${genre}"`);
            totalErrors++;
        }
    }

    for (const category of Object.values(categories)) {
        try {
            const rows = await fetchFromNewsApi(undefined, category);
            await articleRepo.insertArticles(rows);
            await fetchLogRepo.updateFetchTime(category);
        } catch (error) {
            logger.error({ err: error }, `Failed to fetch category "${category}"`);
            totalErrors++;
        }
    }

    if (totalErrors > 0) {
        logger.warn(`Completed with ${totalErrors} error(s)`);
    }

    return totalErrors;
}

export function findGenreKey(genre: string): string | undefined {
    return Object.keys(techGenres).find((k) => {
        return techGenres[k as keyof typeof techGenres] === genre;
    });
}
