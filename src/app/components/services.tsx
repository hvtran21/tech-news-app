import * as SQLite from 'expo-sqlite';
import Article from './constants';
import { updateArticleQueryTime } from './utilities';

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'http://localhost:8081';

export async function syncArticles(genre?: string, category?: string) {
    try {
        let results = null;
        if (genre) {
            const count = await fetchAndCacheArticles(genre, undefined);
            if (count === undefined || count === null) {
                console.error(`[sync] No articles returned from API for genre "${genre}"`);
                return;
            }
            results = await getArticles(genre, undefined);
        } else if (category) {
            const count = await fetchAndCacheArticles(undefined, category);
            if (count === undefined || count === null) {
                console.error(`[sync] No articles returned from API for category "${category}"`);
                return;
            }
            results = await getArticles(undefined, category);
        }
        updateArticleQueryTime();
        return results as Article[];
    } catch (error) {
        console.error('[sync] syncArticles failed:', error);
    }
}

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export default async function getArticles(
    genres?: string,
    category?: string,
    limit: number = 20,
    offset: number = 0,
): Promise<Article[] | undefined> {
    const db = await SQLite.openDatabaseAsync('newsapp');

    if (genres !== undefined && category === undefined) {
        const genreList = genres.split(',');
        const results = await Promise.all(
            genreList.map(async (genre) => {
                return await db.getAllAsync(
                    'SELECT * FROM articles WHERE genre = ? LIMIT ? OFFSET ?',
                    [genre, limit, offset],
                );
            }),
        );
        if (results) {
            return shuffle(results.flat() as Article[]);
        }
    } else if (category !== undefined && genres === undefined) {
        const results = await db.getAllAsync(
            'SELECT * FROM articles WHERE category = ? LIMIT ? OFFSET ?',
            [category, limit, offset],
        );
        if (results) {
            return shuffle(results.flat() as Article[]);
        }
    }
}

export async function getSavedArticles(): Promise<Article[]> {
    const db = await SQLite.openDatabaseAsync('newsapp');
    const results = await db.getAllAsync('SELECT * FROM articles WHERE saved = 1');
    return (results as Article[]) ?? [];
}

export async function getAllArticles(limit: number = 100, offset: number = 0): Promise<Article[]> {
    const db = await SQLite.openDatabaseAsync('newsapp');
    const results = await db.getAllAsync(
        'SELECT * FROM articles ORDER BY published_at DESC LIMIT ? OFFSET ?',
        [limit, offset],
    );
    return (results as Article[]) ?? [];
}

export async function searchArticles(query: string): Promise<Article[]> {
    const db = await SQLite.openDatabaseAsync('newsapp');
    const searchTerm = `%${query}%`;
    const results = await db.getAllAsync(
        'SELECT * FROM articles WHERE title LIKE ? OR description LIKE ? LIMIT 50',
        [searchTerm, searchTerm],
    );
    return (results as Article[]) ?? [];
}

// Fetches articles from the backend API and inserts them into local SQLite
export async function fetchAndCacheArticles(
    genre?: string,
    category?: string,
    limit: number = 100,
) {
    try {
        const response = await fetch(`${BASE_URL}/api/GetArticles`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                genre: genre || undefined,
                category: category || undefined,
                limit,
            }),
        });

        if (response.status === 500) {
            console.error('[api] Server returned 500 — is the backend running?');
            return;
        }

        if (!response.ok) {
            console.error(`[api] Request failed with status ${response.status}`);
            return;
        }

        const data = await response.json();
        const articles = data.articles as Article[];

        const db = await SQLite.openDatabaseAsync('newsapp');
        const statement = await db.prepareAsync(
            'INSERT OR IGNORE INTO articles(id, genre, category, source, author, title, description, url, url_to_image, published_at, content, saved) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        );

        let insertedCount = 0;
        try {
            for (const article of articles) {
                const result = await statement.executeAsync([
                    article.id,
                    article.genre ?? null,
                    article.category ?? null,
                    article.source ?? null,
                    article.author ?? null,
                    article.title ?? null,
                    article.description ?? null,
                    article.url?.toString() ?? null,
                    article.url_to_image?.toString() ?? null,
                    article.published_at ?? null,
                    article.content ?? null,
                    0,
                ]);
                if (result.changes > 0) insertedCount++;
            }
        } finally {
            await statement.finalizeAsync();
        }

        return insertedCount;
    } catch (error) {
        console.error('[api] fetchAndCacheArticles failed:', error);
    }
}
