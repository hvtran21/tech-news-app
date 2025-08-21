import * as SQLite from 'expo-sqlite';
import Article from './constants';

// delete articles by parameter: days -> how old articles can be from at the time the function called.
export async function DeleteArticlesByAge(days?: number): Promise<number> {
    var cutOFfDays = 7;
    if (days) {
        cutOFfDays = days;
    }

    const db = await SQLite.openDatabaseAsync('newsapp');
    const today = new Date();
    today.setDate(today.getDate() - cutOFfDays);
    const cutOffDate = today.toISOString().split('T')[0];

    try {
        const result = await db.runAsync(
            'DELETE FROM articles WHERE published_at <= $date AND saved = 0',
            {
                $date: cutOffDate,
            },
        );
        console.log(`${result.changes} articles were removed.`);
    } catch (error) {
        console.error(error);
        return -1;
    }

    return 0;
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
            console.error(`Deleteing article ${id} failed, it may not exist, or ID is wrong.`);
        }
    } catch (error) {
        console.error(`Error ocurred: ${error}`);
    }
}

// Gets and returns articles using the as an Article object
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
        console.error(`Error ocurred: ${error}`);
    }
}

export function sortArticlesByDate(articles: Article[]): Article[] {
    const result = [...articles].sort(
        (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
    );
    return result;
}
