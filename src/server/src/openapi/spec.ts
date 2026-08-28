import { z } from 'zod';
import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { listArticlesQuery, searchArticlesQuery, cleanupBody } from '../schemas/requests';

// Registers every route's request/response shapes against the same zod schemas
// that validate requests at runtime (see src/schemas/requests.ts), so the spec
// can never drift from what the server actually accepts.
//
// Routes stay pure (no OpenAPI JSDoc comments, no registerPath calls) to avoid
// a circular import between routes/ and openapi/ — this module imports the
// schemas it needs and does all registration in one place.
const registry = new OpenAPIRegistry();

const adminTokenScheme = registry.registerComponent('securitySchemes', 'adminToken', {
    type: 'apiKey',
    in: 'header',
    name: 'x-admin-token',
});

const articleSchema = z.object({
    id: z.string(),
    genre: z.string().nullable(),
    category: z.string().nullable(),
    source: z.string().nullable(),
    author: z.string().nullable(),
    title: z.string(),
    description: z.string(),
    url: z.string(),
    url_to_image: z.string(),
    published_at: z.string(),
    content: z.string().optional(),
});

const errorResponse = z.object({
    error: z.string(),
    code: z.string().optional(),
});

registry.registerPath({
    method: 'get',
    path: '/health',
    summary: 'Health check (verifies PostgreSQL connectivity)',
    tags: ['Health'],
    responses: {
        200: {
            description: 'Service is healthy',
            content: {
                'application/json': {
                    schema: z.object({ status: z.literal('ok'), service: z.string() }),
                },
            },
        },
        503: {
            description: 'Database unreachable',
            content: {
                'application/json': {
                    schema: z.object({ status: z.literal('unhealthy'), error: z.string() }),
                },
            },
        },
    },
});

registry.registerPath({
    method: 'get',
    path: '/api/articles',
    summary: 'Get articles by genre or category (auto-fetches from NewsAPI if stale)',
    tags: ['Articles'],
    request: { query: listArticlesQuery },
    responses: {
        200: {
            description: 'Articles retrieved successfully',
            content: {
                'application/json': {
                    schema: z.object({
                        articles: z.array(articleSchema),
                        nextCursor: z.string().nullable(),
                    }),
                },
            },
        },
        400: {
            description:
                'Invalid or missing genre/category, invalid cursor, or CSV genre with cursor',
            content: { 'application/json': { schema: errorResponse } },
        },
    },
});

registry.registerPath({
    method: 'get',
    path: '/api/articles/search',
    summary: 'Search articles by title/description text',
    tags: ['Articles'],
    request: { query: searchArticlesQuery },
    responses: {
        200: {
            description: 'Matching articles',
            content: {
                'application/json': {
                    schema: z.object({ articles: z.array(articleSchema) }),
                },
            },
        },
        400: {
            description: 'Invalid query',
            content: { 'application/json': { schema: errorResponse } },
        },
    },
});

registry.registerPath({
    method: 'post',
    path: '/api/admin/refresh',
    summary: 'Force-fetch articles from NewsAPI for all genres and categories (ignores staleness)',
    tags: ['Admin'],
    security: [{ [adminTokenScheme.name]: [] }],
    responses: {
        200: {
            description: 'Articles fetched and stored successfully',
            content: {
                'application/json': {
                    schema: z.object({ ok: z.boolean(), message: z.string() }),
                },
            },
        },
        401: {
            description: 'Missing or invalid admin token',
            content: { 'application/json': { schema: errorResponse } },
        },
    },
});

registry.registerPath({
    method: 'post',
    path: '/api/admin/cleanup',
    summary: 'Remove old articles from the database',
    tags: ['Admin'],
    security: [{ [adminTokenScheme.name]: [] }],
    request: {
        body: {
            content: { 'application/json': { schema: cleanupBody } },
        },
    },
    responses: {
        200: {
            description: 'Articles removed successfully',
            content: {
                'application/json': {
                    schema: z.object({ ok: z.boolean(), message: z.string(), removed: z.number() }),
                },
            },
        },
        400: {
            description: 'Invalid body',
            content: { 'application/json': { schema: errorResponse } },
        },
        401: {
            description: 'Missing or invalid admin token',
            content: { 'application/json': { schema: errorResponse } },
        },
    },
});

let cachedDocument: ReturnType<OpenApiGeneratorV3['generateDocument']> | undefined;

export function getOpenApiDocument() {
    if (!cachedDocument) {
        const generator = new OpenApiGeneratorV3(registry.definitions);
        cachedDocument = generator.generateDocument({
            openapi: '3.0.0',
            info: {
                title: 'Tech News API',
                version: '1.0.0',
                description: 'API for fetching and managing tech news articles',
            },
            servers: [
                {
                    url: 'http://localhost:{port}',
                    variables: { port: { default: '8000' } },
                },
            ],
        });
    }
    return cachedDocument;
}
