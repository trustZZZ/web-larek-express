import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import UnauthorizedError from '../errors/unautherized-error';

dotenv.config();

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'super-secret';

const extractBearerToken = (header: string) => header.replace('Bearer ', '');

export default (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Ошибка авторизации'));
  }

  const token = extractBearerToken(authorization);
  let payload: JwtPayload;

  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);

    if (typeof decoded === 'string' || decoded.type !== 'access') {
      return next(new UnauthorizedError('Ошибка авторизации'));
    }

    payload = decoded;
  } catch (error) {
    return next(new UnauthorizedError('Ошибка авторизации'));
  }

  req.user = payload;

  return next();
};
