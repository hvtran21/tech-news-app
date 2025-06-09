import * as SQLite from 'expo-sqlite';

const BASE_URL = 'http://localhost:8000'

interface Article {
    id: string;
    genre: string;
    source: string;
    author: string | null;
    title: string;
    description: string;
    url: URL;
    urlToImage: URL;
    publishedAt: string;
    content?: string;
}

async function retrieveArticles(genres: string) {
    try {
        var response = await fetch(`${BASE_URL}/api/articles`, {
            // TODO: Add authorization somewhere. Maybe here, maybe not.
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                genre: {genres},   // comma seperated string
            }),
        });
        if (!response.ok) {
            throw new Error(`Error ocurred, response status: ${response.status}`);
        }
        var data = await response.json();
        const articles = data.articles as Article[];
        const results = articles.map(article => ({
            id: article.id,
            genre: article.genre,
            source: article.source,
            author: article.author,
            title: article.title,
            description: article.description,
            url: article.url,
            url_to_image: article.urlToImage,
            published_at: new Date(article.publishedAt),
            content: article.content
        }))

        // add results to database
        try {
            await Promise.all(results.map(async (article) => {
                const db = await SQLite.openDatabaseAsync('newsapp');
                const statement = await db.prepareAsync(`INSERT INTO articles(id, genre, source, author, title, description, url, url_to_image, published_at, content) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
                await statement.executeAsync([
                    article.id,
                    article.genre ?? null,
                    article.source ?? null,
                    article.author ?? null,
                    article.title ?? null,
                    article.description ?? null,
                    article.url?.toString() ?? null,
                    article.url_to_image?.toString() ?? null,
                    new Date(article.published_at).toISOString(),
                    article.content ?? null
                ]);
                await statement.finalizeAsync();
            })
        );

        } catch (error) {
            console.error(`Error ocurred inserting data into local DB: ${error}`)
        }

    } catch (error) {
        console.error(`Error ocurred: ${error}`);
    }
}

export default retrieveArticles;