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
    published_at DATE,
    content TEXT,
    UNIQUE(url, title)
    );
`;

export { articleTableDefinition };
