import winston from 'winston';
import expressWinston from 'express-winston';

const LOGGER_OPTIONS = {
  transports: [
    new winston.transports.Console(),
  ],
  format: winston.format.json(),
  headerBlacklist: ['authorization', 'cookie'],
};

export const requestLogger = expressWinston.logger(LOGGER_OPTIONS);

export const errorLogger = expressWinston.errorLogger(LOGGER_OPTIONS);
