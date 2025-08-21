import * as SQLite from 'expo-sqlite';
import Article from './constants';

const BASE_URL = 'http://192.168.0.233:8000';

export async function fetchAndSaveArticles(genreSelection?: string, category?: string) {
    // get articles by genre selection
    var results = null;
    if (genreSelection) {
        await articleAPI(genreSelection, undefined);
        results = await getArticles(genreSelection, undefined);
    } else if (category) {
        await articleAPI(undefined, category);
        results = await getArticles(undefined, category);
    }
    return results;
}

// fetches articles from SQLite DB
export default async function getArticles(
    genreSelection: string | undefined,
    category: string | undefined,
) {
    const db = await SQLite.openDatabaseAsync('newsapp');
    var results = null;

    // genreSelection can be comma seperated genres
    if (genreSelection !== undefined && category === undefined) {
        const genreArr = genreSelection.split(',');
        results = Promise.all(
            genreArr.map(async (genre) => {
                const query_results = await db.getAllAsync(
                    'SELECT * FROM articles WHERE genre = ? LIMIT 5',
                    [genre],
                );
                return query_results;
            }),
        );
        return (await results).flat();
    } else if (category !== undefined && genreSelection === undefined) {
        return await db.getAllAsync('SELECT * FROM articles WHERE category = ?', [category]);
    }
}

// fetches articles the endpoint /api/articles, optionally can give either genre or category
export async function articleAPI(genreSelection?: string, category?: string) {
    var genre = '';
    var cat = '';

    if (genreSelection) {
        genre = genreSelection;
    }

    if (category) {
        cat = category;
    }

    try {
        var response = await fetch(`${BASE_URL}/api/GetArticles`, {
            // TODO: Add authorization somewhere. Maybe here, maybe not.
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                genre: { genre },
                category: { cat },
            }),
        });
        if (!response.ok) {
            throw new Error(`Error ocurred, response status: ${response.status}`);
        }
        var data = await response.json();
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

        // add results to database
        try {
            await Promise.all(
                results.map(async (article) => {
                    console.log(`Inserting article: ${article.id}`);
                    const db = await SQLite.openDatabaseAsync('newsapp');
                    const existing_article = await db.getFirstAsync(
                        'SELECT id FROM articles WHERE id = ?',
                        [article.id],
                    );
                    if (existing_article) {
                        console.log(`Article with ID ${article.id} exists in DB. Skipping.`);
                        return;
                    }
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
                }),
            );
            return results.length;
        } catch (error) {
            console.error(`Error ocurred inserting data into local DB: ${error}`);
        }
    } catch (error) {
        console.error(`Error ocurred: ${error}`);
    }
}
