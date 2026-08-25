import { z } from 'zod';

export const listArticlesQuery = z
    .object({
        genre: z.string().min(1).optional(),
        category: z.string().min(1).optional(),
        limit: z.coerce.number().int().min(1).max(500).default(100),
    })
    .refine((v) => v.genre || v.category, { message: 'genre or category required' });

export type ListArticlesQuery = z.infer<typeof listArticlesQuery>;

export const cleanupBody = z.object({
    days: z.coerce.number().int().min(1).max(365).default(7),
});

export type CleanupBody = z.infer<typeof cleanupBody>;
