import db from './db';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

interface Article {
    // this interface allows us to map each parameter in the articles array
    // to this interface, allowing TS to see the types we intend on assigning.
    id: string;
    genre: string | null;
    category: string | null;
    source: { name: string };
    author: string | null;
    title: string;
    description: string;
    url: string;
    urlToImage: string;
    publishedAt: Date;
    content?: string;
}

async function fetchArticles(genre?: string | undefined, category?: string | undefined) {
    // Parameters: None
    // Return: None
    // Fetches a news article from News API, and adds it to database
    const apiKey = process.env.NEWS_API_KEY;
    const country = 'us'; // should be based off of user preferences later
    var page = 1;
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    var totalProcesssed = 0;
    var totalResults = Infinity;
    var url = '';
    while (totalProcesssed < totalResults) {
        // fetch data from News API
        try {
            if (genre !== undefined && category === undefined) {
                url = `https://newsapi.org/v2/top-headlines?q=${genre}&country=${country}&apiKey=${apiKey}&page=${page}`;
            } else if (category !== undefined && genre === undefined) {
                const cat = category.toLowerCase();
                url = `https://newsapi.org/v2/top-headlines?country=${country}&category=${cat}&apiKey=${apiKey}&page=${page}`;
            }

            const encoded_url = encodeURI(url);
            const response = await fetch(encoded_url);

            if (response.status === 429) {
                // rate limit hit
                console.log('Rate limit hit. Next request in 3 seconds...');
                await delay(3000);
                continue;
            }

            if (!response.ok) {
                throw new Error(`Error ocurred, response status: ${response.status}`);
            }

            // save data in memory
            var data = await response.json();

            // set up data to be inserted into db
            const articles: Article[] = data.articles;
            if (articles.length === 0) {
                console.log(`0 articles to process for ${genre ?? category}`);
                break;
            }

            totalResults = data.totalResults;
            totalProcesssed += articles.length;
            const lst = articles.map((article) => ({
                id: uuidv4(),
                genre: genre,
                category: category,
                source: article.source.name,
                author: article.author,
                title: article.title,
                description: article.description,
                url: article.url,
                url_to_image: article.urlToImage,
                published_at: new Date(article.publishedAt),
                content: article.content,
            }));

            // add fetched articles to the database as a batch of inserts
            try {
                await db.tx((t) => {
                    const queries = lst.map((article) => {
                        return t.none(
                            'INSERT INTO articles(id, genre, category, source, author, title, description, url, url_to_image, published_at, content) \
                                VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) \
                                ON CONFLICT (url, title) DO NOTHING',
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
                        );
                    });
                    return t.batch(queries);
                });

                console.log(`${totalResults - totalProcesssed} left to process...`);
                page += 1;
            } catch (error) {
                console.error(`Error inserting articles into DB: ${error}`);
            }
        } catch (error) {
            console.error(`Error ocurred: ${error}`);
        }
        await delay(2000);
    }
}

export default fetchArticles;
export { Article };
