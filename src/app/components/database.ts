import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

const DB_NAME = 'newsapp';

// Versioned migrations, applied in order via PRAGMA user_version.
//
// NOTE: version 1 does not (and must not) attempt to patch pre-Phase-2
// on-device `articles` tables that predate the `category` column — that
// schema drift was pre-existing/rare, and CREATE TABLE IF NOT EXISTS can't
// alter an existing table anyway. For those rare old devices, wiping the
// local cache (fresh install/reinstall) is the intended fix, not a migration.
const MIGRATIONS: { version: number; up: string }[] = [
    {
        version: 1,
        up: `
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
            CREATE TABLE IF NOT EXISTS metadata (
                latest_article_query TEXT
            );
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                display_name TEXT,
                email TEXT,
                avatar_uri TEXT,
                created_at TEXT DEFAULT (datetime('now'))
            );
        `,
    },
];

async function getUserVersion(db: SQLiteDatabase): Promise<number> {
    const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    return row?.user_version ?? 0;
}

export async function initializeDatabase() {
    const db = await openDatabaseAsync(DB_NAME);

    // Apparently 'PRAGMA journal_mode = WAL' can't run outside of a transaction.
    await db.execAsync('PRAGMA journal_mode = WAL;');

    const currentVersion = await getUserVersion(db);
    const pending = MIGRATIONS.filter((m) => m.version > currentVersion).sort(
        (a, b) => a.version - b.version,
    );

    for (const migration of pending) {
        await db.withTransactionAsync(async () => {
            await db.execAsync(migration.up);
        });
        // PRAGMA user_version doesn't support bound parameters; N comes from
        // our own static MIGRATIONS array, not external input.
        await db.execAsync(`PRAGMA user_version = ${migration.version}`);
        console.log(`[db] applied migration ${migration.version}`);
    }
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
