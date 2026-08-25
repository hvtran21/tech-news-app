export interface CursorPayload {
    t: string;
    i: string;
}

export const encodeCursor = (payload: CursorPayload): string =>
    Buffer.from(JSON.stringify(payload)).toString('base64url');

export const decodeCursor = (token: string): CursorPayload | null => {
    try {
        const decoded = Buffer.from(token, 'base64url').toString('utf8');
        const parsed = JSON.parse(decoded) as unknown;
        if (
            typeof parsed === 'object' &&
            parsed !== null &&
            typeof (parsed as Record<string, unknown>).t === 'string' &&
            typeof (parsed as Record<string, unknown>).i === 'string'
        ) {
            return parsed as CursorPayload;
        }
        return null;
    } catch {
        return null;
    }
};
