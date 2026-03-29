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

if (!apiKey) {
    console.warn('[newsapi] NEWS_API_KEY is not set — article fetching will fail');
}

const genreSearchQueries = new Map<string, string>([
    [techGenres.AI, '"artificial intelligence" OR "AI"'],
    [techGenres.ML, '"machine learning" OR "ML"'],
    [techGenres.MICROSOFT, 'Microsoft'],
    [techGenres.CYBERSECURITY, 'cybersecurity OR "cyber security"'],
    [techGenres.GAME_DEVELOPMENT, '"game development" OR gamedev OR "games industry"'],
    [techGenres.GAMING, 'gaming OR videogames OR "video games"'],
    [techGenres.APPLE, 'Apple'],
    [techGenres.AMAZON, 'Amazon'],
    [techGenres.GOOGLE, 'Google'],
    [techGenres.NINTENDO, 'Nintendo'],
    [techGenres.TESLA, 'Tesla OR "electric vehicle" OR EV'],
    [techGenres.SPACE_TECH, 'SpaceX OR NASA OR "space technology" OR satellite'],
    [techGenres.STARTUPS, 'startup OR "venture capital" OR "series A" OR YC'],
    [techGenres.BLOCKCHAIN, 'blockchain OR crypto OR "web3"'],
    [techGenres.ROBOTICS, 'robotics OR "humanoid robot" OR automation'],
]);

async function insertArticles(
    articles: Article[],
    genre: string | undefined,
    category: string | undefined,
) {
    const rows = articles
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

    if (rows.length === 0) return 0;

    try {
        await db.tx((t) => {
            const queries = rows.map((article) => {
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
        return rows.length;
    } catch (error) {
        console.error(`[newsapi] Error inserting articles into DB:`, error);
        return 0;
    }
}

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
                const q = genreSearchQueries.get(genre.trim()) ?? genre;
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

            const source = genre ?? category;

            if (response.status === 429) {
                console.warn(`[newsapi] Rate limited on "${source}", retrying in 3s`);
                await delay(3000);
                continue;
            }

            if (!response.ok) {
                const body = await response.text();
                console.error(`[newsapi] API error ${response.status} for "${source}": ${body}`);
                break;
            }

            const data = await response.json();
            const articles: Article[] = data.articles ?? [];

            if (articles.length === 0) {
                console.log(`[newsapi] No articles found for "${source}"`);
                break;
            }

            totalResults = data.totalResults;
            const inserted = await insertArticles(articles, genre, category);
            totalProcessed += articles.length;

            console.log(
                `[newsapi] ${source} page ${page}: ${inserted} inserted, ${totalResults - totalProcessed} remaining`,
            );
            page += 1;
        } catch (error) {
            console.error(`[newsapi] Fetch error for "${genre ?? category}":`, error);
            break;
        }

        await delay(1500);
    }
}

export default fetchArticles;
export { Article };
