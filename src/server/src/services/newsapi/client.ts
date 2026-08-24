import { v4 as uuidv4 } from 'uuid';
import { env } from '../../config/env';
import logger from '../../lib/logger';
import { curatedDomains, curatedSources } from '../../../constants';
import { genreSearchQueries } from './queries';
import type { ArticleRow } from '../../repositories/articleRepo';

// Shape of an article as returned by the NewsAPI response (distinct from our DB row shape).
interface NewsApiArticle {
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
const apiKey = env.NEWS_API_KEY;

function mapToArticleRows(
    articles: NewsApiArticle[],
    genre: string | undefined,
    category: string | undefined,
): ArticleRow[] {
    return articles
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
}

// Fetches all pages of articles for a genre or category from NewsAPI and returns
// them as fully-mapped rows ready for insertion. Does not touch the DB itself.
export async function fetchFromNewsApi(
    genre?: string,
    category?: string,
): Promise<ArticleRow[]> {
    let page = 1;
    let totalProcessed = 0;
    let totalResults = Infinity;
    const maxArticles = 100;
    const collected: ArticleRow[] = [];

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
                logger.warn(`Rate limited on "${source}", retrying in 3s`);
                await delay(3000);
                continue;
            }

            if (!response.ok) {
                const body = await response.text();
                logger.error(`API error ${response.status} for "${source}": ${body}`);
                break;
            }

            const data = await response.json();
            const articles: NewsApiArticle[] = data.articles ?? [];

            if (articles.length === 0) {
                logger.info(`No articles found for "${source}"`);
                break;
            }

            totalResults = data.totalResults;
            const rows = mapToArticleRows(articles, genre, category);
            collected.push(...rows);
            totalProcessed += articles.length;

            logger.info(
                `${source} page ${page}: ${rows.length} mapped, ${totalResults - totalProcessed} remaining`,
            );
            page += 1;
        } catch (error) {
            logger.error({ err: error }, `Fetch error for "${genre ?? category}"`);
            break;
        }

        await delay(1500);
    }

    return collected;
}

export type { NewsApiArticle };
