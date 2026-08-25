import db from '../../db';
import logger from '../lib/logger';

export interface ArticleRow {
    id: string;
    genre: string | null;
    category: string | null;
    source: string | null;
    author: string | null;
    title: string;
    description: string;
    url: string;
    url_to_image: string;
    published_at: Date;
    content?: string;
}

// The row shape returned by SELECT is identical to what we insert.
export type Article = ArticleRow;

export async function insertArticles(rows: ArticleRow[]): Promise<number> {
    if (rows.length === 0) return 0;

    try {
        await db.tx((t) => {
            const queries = rows.map((article) =>
                t.none(
                    `INSERT INTO articles(id, genre, category, source, author, title, description, url, url_to_image, published_at, content)
                     VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                     ON CONFLICT (url, title) DO NOTHING`,
                    [
                        article.id,
                        article.genre,
                        article.category,
                        article.source,
                        article.author,
                        article.title,
                        article.description,
                        article.url,
                        article.url_to_image,
                        article.published_at,
                        article.content,
                    ],
                ),
            );
            return t.batch(queries);
        });
        return rows.length;
    } catch (error) {
        logger.error({ err: error }, 'Error inserting articles into DB');
        return 0;
    }
}

export interface Cursor {
    t: string;
    i: string;
}

export async function listByGenre(genre: string, limit: number, cursor?: Cursor): Promise<Article[]> {
    if (cursor) {
        return db.any(
            `SELECT * FROM articles
             WHERE genre = $1 AND (published_at, id) < ($2, $3)
             ORDER BY published_at DESC NULLS LAST, id DESC
             LIMIT $4`,
            [genre, cursor.t, cursor.i, limit],
        );
    }
    return db.any(
        `SELECT * FROM articles
         WHERE genre = $1
         ORDER BY published_at DESC NULLS LAST, id DESC
         LIMIT $2`,
        [genre, limit],
    );
}

export async function listByCategory(category: string, limit: number, cursor?: Cursor): Promise<Article[]> {
    if (cursor) {
        return db.any(
            `SELECT * FROM articles
             WHERE category = $1 AND (published_at, id) < ($2, $3)
             ORDER BY published_at DESC NULLS LAST, id DESC
             LIMIT $4`,
            [category, cursor.t, cursor.i, limit],
        );
    }
    return db.any(
        `SELECT * FROM articles
         WHERE category = $1
         ORDER BY published_at DESC NULLS LAST, id DESC
         LIMIT $2`,
        [category, limit],
    );
}

export async function searchByText(query: string, limit: number): Promise<Article[]> {
    return db.any(
        `SELECT * FROM articles
         WHERE title ILIKE $1 OR description ILIKE $1
         ORDER BY published_at DESC NULLS LAST
         LIMIT $2`,
        [`%${query}%`, limit],
    );
}

export async function deleteOlderThan(cutoffDate: string): Promise<number> {
    const result = await db.result('DELETE FROM articles WHERE published_at <= $1', cutoffDate);
    return result.rowCount ?? 0;
}
