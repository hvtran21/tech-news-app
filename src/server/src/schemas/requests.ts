import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

// Mutates the Zod `z` namespace so `.openapi(...)` is available on schemas.
// Must run once, before any schema below is defined, and before any other
// module imports `z` and starts building schemas from it.
extendZodWithOpenApi(z);

export const listArticlesQuery = z
    .object({
        genre: z.string().min(1).optional().openapi({ description: 'Comma-separated genre values' }),
        category: z.string().min(1).optional(),
        limit: z.coerce.number().int().min(1).max(500).default(100),
        cursor: z.string().optional().openapi({ description: 'Opaque cursor from a previous nextCursor' }),
    })
    .refine((v) => v.genre || v.category, { message: 'genre or category required' })
    .openapi('ListArticlesQuery');

export type ListArticlesQuery = z.infer<typeof listArticlesQuery>;

export const cleanupBody = z
    .object({
        days: z.coerce.number().int().min(1).max(365).default(7).openapi({ description: 'Number of days to keep' }),
    })
    .openapi('CleanupBody');

export type CleanupBody = z.infer<typeof cleanupBody>;

export const searchArticlesQuery = z
    .object({
        q: z.string().min(2).max(200).openapi({ description: 'Search term (min 2 chars)' }),
        limit: z.coerce.number().int().min(1).max(100).default(20),
    })
    .openapi('SearchArticlesQuery');

export type SearchArticlesQuery = z.infer<typeof searchArticlesQuery>;
