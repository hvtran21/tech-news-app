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
        await db.runAsync('DELETE FROM articles WHERE published_at <= $date AND saved = 0', {
            $date: cutOffDate,
        });
    } catch (error) {
        console.error(error);
        return -1;
    }

    return 0;
}

// Gets and returns articles using the as an Article object
export default async function getArticleByID(id: string) {
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
