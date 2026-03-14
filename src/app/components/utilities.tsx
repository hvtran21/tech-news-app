import * as SQLite from 'expo-sqlite';
import Article from './constants';

type metadataSchema = {
    latest_article_query: string | null;
};

export async function deleteArticlesByAge(days?: number): Promise<number> {
    let articlesDeleted;
    const cutOffDays = days ?? 4;

    const db = await SQLite.openDatabaseAsync('newsapp');
    const today = new Date();
    today.setDate(today.getDate() - cutOffDays);
    const cutOffDate = today.toISOString().split('T')[0];

    try {
        const result = await db.runAsync(
            'DELETE FROM articles WHERE published_at <= $date AND saved = 0',
            {
                $date: cutOffDate,
            },
        );
        console.log(`${result.changes} articles were removed.`);
        articlesDeleted = result.changes;
    } catch (error) {
        console.error(error);
        return -1;
    }

    return articlesDeleted;
}

export async function deleteArticlesById(id: string) {
    const db = await SQLite.openDatabaseAsync('newsapp');
    try {
        const result = await db.runAsync('DELETE FROM articles WHERE id = $id', {
            $id: id,
        });

        if (result.changes === 1) {
            console.log(`Successfully removed article ${id}`);
            return;
        } else {
            console.error(`Deleting article ${id} failed, it may not exist, or ID is wrong.`);
        }
    } catch (error) {
        console.error(`Error occurred: ${error}`);
    }
}

export default async function getArticleById(id: string) {
    const db = await SQLite.openDatabaseAsync('newsapp');
    try {
        const article = (await db.getFirstAsync('SELECT * FROM articles WHERE id = ?', [
            id,
        ])) as Article;
        if (!article) {
            throw new Error(`Article with ID ${id} not found`);
        }
        return article;
    } catch (error) {
        console.error(`Error occurred: ${error}`);
    }
}

export function sortArticlesByDate(articles: Article[]): Article[] {
    const result = [...articles].sort(
        (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
    );
    return result;
}

export async function updateArticleQueryTime() {
    const currentDate = new Date().toISOString();
    const db = await SQLite.openDatabaseAsync('newsapp');
    try {
        const result = await db.runAsync('UPDATE metadata SET latest_article_query = $date', {
            $date: currentDate,
        });

        if (result.changes === 0) {
            await db.runAsync('INSERT INTO metadata (latest_article_query) VALUES ($date)', {
                $date: currentDate,
            });
        }

        console.log(`Updated article query date: ${currentDate}`);
    } catch (error) {
        console.error(error);
    }
}

export async function canRefreshArticles() {
    const refreshLimitInMin = 0.5;
    const db = await SQLite.openDatabaseAsync('newsapp');

    try {
        const query = (await db.getFirstAsync('SELECT * FROM metadata')) as metadataSchema;

        if (query === null || query === undefined) {
            return true;
        }

        const queryResult = query.latest_article_query ?? '';

        if (!queryResult) {
            throw new Error('latest_article_query is empty. This should not have happened..');
        }

        const latestQueryTime = new Date(queryResult);
        const currentTime = new Date();
        const differenceInMS = Math.abs(currentTime.getTime() - latestQueryTime.getTime());
        const differenceInMin = differenceInMS / (1000 * 60);

        if (differenceInMin < refreshLimitInMin) {
            console.log('Refresh cooldown in effect.');
            return false;
        }
    } catch (error) {
        console.error(error);
    }

    console.log('Refresh approved!');
    return true;
}
