import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { ZodTypeAny, z } from 'zod';

type Source = 'body' | 'query' | 'params';

// Mutate the existing object in place rather than reassigning req[source] —
// Express 5's `req.query` is a getter-only property, so `req.query = ...` throws.
export const validate = <S extends ZodTypeAny>(schema: S, source: Source = 'body'): RequestHandler =>
    (req: Request, _res: Response, next: NextFunction) => {
        const result = schema.safeParse(req[source]);
        if (!result.success) return next(result.error);
        const target = req[source] as Record<string, unknown>;
        for (const key of Object.keys(target)) delete target[key];
        Object.assign(target, result.data as z.infer<S>);
        next();
    };

export default validate;
