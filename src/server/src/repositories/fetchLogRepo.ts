import db from '../../db';

// Returns true if the source hasn't been fetched within `thresholdMs`.
export async function isStale(sourceKey: string, thresholdMs: number): Promise<boolean> {
    const row = await db.oneOrNone(
        'SELECT last_fetched_at FROM fetch_log WHERE source_key = $1',
        sourceKey,
    );

    if (!row) return true;

    const elapsed = Date.now() - new Date(row.last_fetched_at).getTime();
    return elapsed > thresholdMs;
}

export async function updateFetchTime(sourceKey: string): Promise<void> {
    await db.none(
        `INSERT INTO fetch_log (source_key, last_fetched_at) VALUES ($1, NOW())
         ON CONFLICT (source_key) DO UPDATE SET last_fetched_at = NOW()`,
        sourceKey,
    );
}
