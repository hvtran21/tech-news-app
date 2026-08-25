import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { ZodTypeAny, z } from 'zod';

type Source = 'body' | 'query' | 'params';

// Express 5 defines req.query as a re-parsing getter — plain assignment throws,
// and in-place mutation gets discarded on next access. Object.defineProperty
// replaces the getter with a plain writable value that persists.
export const validate = <S extends ZodTypeAny>(schema: S, source: Source = 'body'): RequestHandler =>
    (req: Request, _res: Response, next: NextFunction) => {
        const result = schema.safeParse(req[source]);
        if (!result.success) return next(result.error);
        Object.defineProperty(req, source, {
            value: result.data as z.infer<S>,
            writable: true,
            configurable: true,
            enumerable: true,
        });
        next();
    };

export default validate;
