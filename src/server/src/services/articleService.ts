import * as articleRepo from '../repositories/articleRepo';
import type { Article, Cursor } from '../repositories/articleRepo';
import { BadRequestError } from '../lib/errors';
import logger from '../lib/logger';

const formatDateUTC = (d: Date): string => {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

export async function listByGenres(genresCsv: string, limit: number, cursor?: Cursor): Promise<Article[]> {
    const genreArray = genresCsv.split(',');
    if (cursor && genreArray.length > 1) {
        const err = new BadRequestError('Cursor pagination requires a single genre or category, not a CSV');
        err.code = 'CursorNotSupported';
        throw err;
    }
    if (genreArray.length === 1) {
        return articleRepo.listByGenre(genreArray[0], limit, cursor);
    }
    const results = await Promise.all(
        genreArray.map((genre) => articleRepo.listByGenre(genre, limit)),
    );
    return results.flat();
}

export async function listByCategory(category: string, limit: number, cursor?: Cursor): Promise<Article[]> {
    return articleRepo.listByCategory(category, limit, cursor);
}

export async function search(q: string, limit: number): Promise<Article[]> {
    return articleRepo.searchByText(q, limit);
}

export async function deleteOldArticles(days: number): Promise<number> {
    const now = new Date();
    const cutoffDate = formatDateUTC(new Date(now.getTime() - days * 24 * 60 * 60 * 1000));
    const removed = await articleRepo.deleteOlderThan(cutoffDate);
    logger.info(`Removed ${removed} article(s) older than ${days} days`);
    return removed;
}
