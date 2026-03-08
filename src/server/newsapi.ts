import db from './db';
import dotenv from 'dotenv';
import techGenres, { curatedDomains, curatedSources } from './constants';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

interface Article {
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

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const apiKey = process.env.NEWS_API_KEY;

const betterSearchMap = new Map<string, string>([
    [techGenres.AI, '"artificial intelligence" OR "AI"'],
    [techGenres.ML, '"machine learning" OR "ML"'],
    [techGenres.MICROSOFT, 'Microsoft'],
    [techGenres.CYBERSECURITY, 'cybersecurity OR "cyber security"'],
    [techGenres.GAME_DEVELOPMENT, '"game development" OR gamedev OR "games industry"'],
    [techGenres.GAMING, 'gaming OR videogames OR "video games"'],
    [techGenres.APPLE, 'Apple'],
    [techGenres.AMAZON, 'Amazon'],
    [techGenres.NINTENDO, 'Nintendo'],
]);

async function insertArticles(
    articles: Article[],
    genre: string | undefined,
    category: string | undefined,
) {
    const lst = articles
        .filter((a) => a.title && a.title !== '[Removed]')
        .map((article) => ({
            id: uuidv4(),
            genre: genre ?? null,
            category: category ?? null,
            source: article.source?.name ?? null,
            author: article.author,
            title: article.title,
            description: article.description,
            url: article.url,
            url_to_image: article.urlToImage,
            published_at: new Date(article.publishedAt),
            content: article.content,
        }));

    if (lst.length === 0) return 0;

    try {
        await db.tx((t) => {
            const queries = lst.map((article) => {
                return t.none(
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
                );
            });
            return t.batch(queries);
        });
        return lst.length;
    } catch (error) {
        console.error(`Error inserting articles into DB: ${error}`);
        return 0;
    }
}

/**
 * Fetch articles from the /everything endpoint, filtered to curated domains.
 * Used for genre-based queries (AI, Gaming, Apple, etc.)
 */
async function fetchArticles(genre?: string, category?: string) {
    let page = 1;
    let totalProcessed = 0;
    let totalResults = Infinity;
    const maxArticles = 100;

    const now = new Date();
    const fromDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days back

    while (totalProcessed < totalResults && totalProcessed < maxArticles) {
        try {
            let url = '';

            if (genre && !category) {
                const q = betterSearchMap.get(genre.trim()) ?? genre;
                url =
                    `https://newsapi.org/v2/everything` +
                    `?q=${encodeURIComponent(q)}` +
                    `&domains=${curatedDomains}` +
                    `&from=${fromDate.toISOString()}` +
                    `&to=${now.toISOString()}` +
                    `&sortBy=publishedAt` +
                    `&language=en` +
                    `&pageSize=50` +
                    `&page=${page}` +
                    `&apiKey=${apiKey}`;
            } else if (category && !genre) {
                // Top headlines with curated sources
                url =
                    `https://newsapi.org/v2/top-headlines` +
                    `?sources=${curatedSources}` +
                    `&pageSize=50` +
                    `&page=${page}` +
                    `&apiKey=${apiKey}`;
            } else {
                break;
            }

            const response = await fetch(url);

            if (response.status === 429) {
                console.log('Rate limit hit. Waiting 3s...');
                await delay(3000);
                continue;
            }

            if (!response.ok) {
                const body = await response.text();
                console.error(`NewsAPI error ${response.status}: ${body}`);
                break;
            }

            const data = await response.json();
            const articles: Article[] = data.articles ?? [];

            if (articles.length === 0) {
                console.log(`No articles for ${genre ?? category}`);
                break;
            }

            totalResults = data.totalResults;
            const inserted = await insertArticles(articles, genre, category);
            totalProcessed += articles.length;

            console.log(
                `[${genre ?? category}] page ${page}: ${inserted} inserted, ${totalResults - totalProcessed} remaining`,
            );
            page += 1;
        } catch (error) {
            console.error(`Fetch error for ${genre ?? category}: ${error}`);
            break;
        }

        await delay(1500);
    }
}

export default fetchArticles;
export { Article };
