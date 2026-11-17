import winston from 'winston';
import path from 'path';
import { dirname } from 'path';

const baseDir = dirname(dirname(__dirname));

export const jobLogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}] ${message}`;
        })
    ),
    transports: [
        new winston.transports.File({
            filename: path.join(baseDir, 'cron.log'),
            level: 'info'
        }),
        new winston.transports.File({
            filename: path.join(baseDir, 'cron-error.log'),
            level: 'error'
        })
    ],
});