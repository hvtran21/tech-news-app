import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { ZodTypeAny, z } from 'zod';

type Source = 'body' | 'query' | 'params';

export const validate = <S extends ZodTypeAny>(schema: S, source: Source = 'body'): RequestHandler =>
    (req: Request, _res: Response, next: NextFunction) => {
        const result = schema.safeParse(req[source]);
        if (!result.success) return next(result.error);
        (req as any)[source] = result.data as z.infer<S>;
        next();
    };

export default validate;
