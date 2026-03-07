import * as SQLite from 'expo-sqlite';
import Article from './constants';
import { updateArticleQueryTime } from './utilities';

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'http://localhost:8081';

export async function downloadAndGetArticles(genreSelection?: string, category?: string) {
    try {
        let results = null;
        if (genreSelection) {
            const count = await articleAPI(genreSelection, undefined);
            if (count === undefined || count === null) {
                console.error(`Error: Received ${count} from the API.`);
                return;
            }
            results = await getArticles(genreSelection, undefined);
        } else if (category) {
            const count = await articleAPI(undefined, category);
            if (count === undefined || count === null) {
                console.error(`Error: Received ${count} from the API.`);
                return;
            }
            results = await getArticles(undefined, category);
        }
        updateArticleQueryTime();
        return results as Article[];
    } catch (error) {
        console.error(error);
    }
}

export default async function getArticles(
    genreSelection?: string,
    category?: string,
    numberOfArticles?: number,
): Promise<Article[] | undefined> {
    const db = await SQLite.openDatabaseAsync('newsapp');
    const articleRetrievalLimit = numberOfArticles || 20;

    if (genreSelection !== undefined && category === undefined) {
        const genreArr = genreSelection.split(',');
        const results = await Promise.all(
            genreArr.map(async (genre) => {
                return await db.getAllAsync(
                    `SELECT * FROM articles WHERE genre = ? LIMIT ${articleRetrievalLimit}`,
                    [genre],
                );
            }),
        );
        if (results) {
            return results.flat() as Article[];
        }
    } else if (category !== undefined && genreSelection === undefined) {
        const results = await db.getAllAsync('SELECT * FROM articles WHERE category = ?', [
            category,
        ]);
        if (results) {
            return results.flat() as Article[];
        }
    }
}

export async function getSavedArticles(): Promise<Article[]> {
    const db = await SQLite.openDatabaseAsync('newsapp');
    const results = await db.getAllAsync('SELECT * FROM articles WHERE saved = 1');
    return (results as Article[]) ?? [];
}

export async function getAllArticles(limit: number = 100): Promise<Article[]> {
    const db = await SQLite.openDatabaseAsync('newsapp');
    const results = await db.getAllAsync(
        'SELECT * FROM articles ORDER BY published_at DESC LIMIT ?',
        [limit],
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

export async function articleAPI(
    genreSelection?: string,
    category?: string,
    limit: number = 100,
) {
    let genre = '';
    let cat = '';

    if (genreSelection) genre = genreSelection;
    if (category) cat = category;

    try {
        const response = await fetch(`${BASE_URL}/api/GetArticles`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                genre: { genre },
                category: { cat },
                articleRetrievalLimit: { limit },
            }),
        });

        if (response.status === 500) {
            console.error('Server is down... start the server?');
            return;
        }

        if (!response.ok) {
            console.error(`Error occurred, response status: ${response.status}`);
            return;
        }

        let articleCount = 0;
        const data = await response.json();
        const articles = data.articles as Article[];
        const results = articles.map((article) => ({
            id: article.id,
            genre: article.genre,
            category: article.category,
            source: article.source,
            author: article.author,
            title: article.title,
            description: article.description,
            url: article.url,
            url_to_image: article.url_to_image,
            published_at: article.published_at,
            content: article.content,
            saved: 0,
        }));

        const db = await SQLite.openDatabaseAsync('newsapp');
        await Promise.all(
            results.map(async (article) => {
                const existing = await db.getFirstAsync(
                    'SELECT id FROM articles WHERE id = ?',
                    [article.id],
                );

                if (!existing) {
                    const statement = await db.prepareAsync(
                        'INSERT OR IGNORE INTO articles(id, genre, category, source, author, title, description, url, url_to_image, published_at, content, saved) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    );
                    await statement.executeAsync([
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
                        article.saved ?? 0,
                    ]);
                    await statement.finalizeAsync();
                    articleCount += 1;
                }
            }),
        );
        return articleCount;
    } catch (error) {
        console.error(`Error occurred: ${error}`);
    }
}
