import * as SQLite from 'expo-sqlite';
import Article from './constants';

// delete articles by parameter: days -> how old articles can be from at the time the function called.
async function DeleteArticlesByAge(days?: number): Promise<number> {
    var cutOffAge = 7;
    if (days) {
        cutOffAge = days;
    }

    const db = await SQLite.openDatabaseAsync('newsapp');
    const today = new Date();
    today.setDate(today.getDate() - cutOffAge);

    return 0;
}

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
