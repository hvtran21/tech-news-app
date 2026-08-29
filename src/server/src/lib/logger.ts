import pino from 'pino';
import { env } from '../config/env';

const logger = pino({
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    base: { service: 'vantage-api' },
    transport:
        env.NODE_ENV === 'production'
            ? undefined
            : {
                  target: 'pino-pretty',
                  options: { colorize: true, translateTime: 'HH:MM:ss' },
              },
});

export type Logger = typeof logger;

export default logger;
