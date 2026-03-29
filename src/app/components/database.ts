import { openDatabaseAsync } from 'expo-sqlite';

const DB_NAME = 'newsapp';

export async function initializeDatabase() {
    const db = await openDatabaseAsync(DB_NAME);

    await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS articles (
            id TEXT PRIMARY KEY,
            genre TEXT,
            category TEXT,
            source TEXT,
            author TEXT,
            title TEXT,
            description TEXT,
            url TEXT,
            url_to_image TEXT,
            published_at TEXT,
            content TEXT,
            saved INTEGER CHECK (saved IN (0, 1)) DEFAULT 0
        );
    `);

    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS metadata (
            latest_article_query TEXT
        );
    `);

    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            display_name TEXT,
            email TEXT,
            avatar_uri TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        );
    `);
}

export async function getUser() {
    const db = await openDatabaseAsync(DB_NAME);
    const user = await db.getFirstAsync('SELECT * FROM users LIMIT 1');
    return user as { id: number; display_name: string | null; email: string | null; avatar_uri: string | null; created_at: string } | null;
}

export async function upsertUser(displayName: string, email?: string) {
    const db = await openDatabaseAsync(DB_NAME);
    const existing = await db.getFirstAsync('SELECT id FROM users LIMIT 1');
    if (existing) {
        await db.runAsync(
            'UPDATE users SET display_name = ?, email = ? WHERE id = ?',
            [displayName, email ?? null, (existing as { id: number }).id],
        );
    } else {
        await db.runAsync(
            'INSERT INTO users (display_name, email) VALUES (?, ?)',
            [displayName, email ?? null],
        );
    }
}
