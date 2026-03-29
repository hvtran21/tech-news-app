const articleTableDefinition = `
    CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY,
    genre VARCHAR(255),
    category VARCHAR(255),
    source VARCHAR(255),
    author VARCHAR(255),
    title TEXT,
    description TEXT,
    url TEXT,
    url_to_image TEXT,
    published_at TIMESTAMPTZ,
    content TEXT,
    UNIQUE(url, title)
    );
    CREATE INDEX IF NOT EXISTS idx_articles_genre ON articles(genre);
    CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
    CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);
`;

// Tracks the last time each genre/category was fetched from NewsAPI.
// Used to avoid redundant fetches when multiple users request the same source.
const fetchLogTableDefinition = `
    CREATE TABLE IF NOT EXISTS fetch_log (
    source_key VARCHAR(255) PRIMARY KEY,
    last_fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
`;

export { articleTableDefinition, fetchLogTableDefinition };
