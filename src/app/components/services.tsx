import * as SQLite from 'expo-sqlite';
import Article from './constants';

const BASE_URL = 'http://192.168.0.233:8000';

export async function downloadAndGetArticles(genreSelection?: string, category?: string) {
    // get articles by genre selection
    try {
        var results = null;
        if (genreSelection) {
            const result = await articleAPI(genreSelection, undefined);

            if (result === undefined || result === null) {
                console.error('Error in articleAPI');
                return;
            }
            console.log(`${result} articles downloaded.`);
            results = await getArticles(genreSelection, undefined);
        } else if (category) {
            const result = await articleAPI(undefined, category);

            if (result === undefined || result === null) {
                console.error('Error in articleAPI');
                return;
            }

            console.log(`${result} articles downloaded.`);
            results = await getArticles(undefined, category);
        }
    } catch (error) {
        console.error(error);
    }

    return results as Article[];
}

// fetches articles from SQLite DB
export default async function getArticles(
    genreSelection?: string,
    category?: string,
    numberOfArticles?: number,
): Promise<Article[] | undefined> {
    const db = await SQLite.openDatabaseAsync('newsapp');
    var results = null;
    var articleRetrievalLimit = 20;
    if (numberOfArticles) {
        articleRetrievalLimit = numberOfArticles;
    }

    // genreSelection can be comma seperated genres
    if (genreSelection !== undefined && category === undefined) {
        const genreArr = genreSelection.split(',');
        results = await Promise.all(
            genreArr.map(async (genre) => {
                const query_results = await db.getAllAsync(
                    `SELECT * FROM articles WHERE genre = ? LIMIT ${articleRetrievalLimit}`,
                    [genre],
                );
                return query_results;
            }),
        );
        if (results) {
            return results.flat() as Article[];
        } else {
            console.error('Error retrieving articles.');
        }
    } else if (category !== undefined && genreSelection === undefined) {
        results = await db.getAllAsync('SELECT * FROM articles WHERE category = ?', [category]);
        if (results) {
            return results.flat() as Article[];
        } else {
            console.error('Error retrieving articles.');
        }
    }
}

// fetches articles the endpoint /api/articles, optionally can give either genre or category
export async function articleAPI(genreSelection?: string, category?: string, limit: number = 100) {
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
                articleRetrievalLimit: { limit },
            }),
        });
        if (!response.ok) {
            throw new Error(`Error ocurred, response status: ${response.status}`);
        }
        var articleCount = 0;
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
        articleCount += results.length;

        // add results to database
        try {
            await Promise.all(
                results.map(async (article) => {
                    // console.log(`Inserting arrticle: ${article.id}`);
                    const db = await SQLite.openDatabaseAsync('newsapp');
                    const existing_article = await db.getFirstAsync(
                        'SELECT id FROM articles WHERE id = ?',
                        [article.id],
                    );
                    if (existing_article) {
                        // console.log(`Article with ID ${article.id} exists in DB. Skipping.`);
                        articleCount -= 1;
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
            return articleCount;
        } catch (error) {
            console.error(`Error ocurred inserting data into local DB: ${error}`);
        }
    } catch (error) {
        console.error(`Error ocurred: ${error}`);
    }
}
