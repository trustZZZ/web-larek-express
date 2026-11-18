import { NextFunction, Request, Response } from 'express';
import bycript from 'bcryptjs';
import ms from 'ms';
import jwt, { JwtPayload } from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import NotFoundError from '../errors/not-found-error';
import UnauthorizedError from '../errors/unautherized-error';
import BadRequestError from '../errors/bad-request-error';

dotenv.config();

type TTokenType = 'access' | 'refresh';
interface ITokenPayload extends JwtPayload {
  _id: string;
  type: TTokenType
}

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'super-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super-secret';

const generateTokens = (_id: string) => {
  const accessExpiry = (process.env.AUTH_ACCESS_TOKEN_EXPIRY || '10m') as ms.StringValue;
  const refreshExpiry = (process.env.AUTH_REFRESH_TOKEN_EXPIRY || '7d') as ms.StringValue;

  const accessToken = jwt.sign({ _id, type: 'access' }, JWT_ACCESS_SECRET, { expiresIn: accessExpiry });
  const refreshToken = jwt.sign({ _id, type: 'refresh' }, JWT_REFRESH_SECRET, { expiresIn: refreshExpiry });
  return { accessToken, refreshToken, refreshExpiry };
};

const setRefreshCookie = (res: Response, refreshToken: string, refreshExpiry: ms.StringValue) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: ms(refreshExpiry),
    path: '/',
  });
};

type TUserResponse = { email: string; name: string };

const authResponse = (user: TUserResponse, accessToken: string) => ({
  user: { email: user.email, name: user.name },
  success: true,
  accessToken,
});

const verifyRefreshToken = (refreshToken: string) => {
  const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as ITokenPayload;

  if (payload.type !== 'refresh') {
    throw new UnauthorizedError('Ошибка авторизации');
  }

  return payload;
};

export const registerUser = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;

  return bycript.hash(password, 10)
    .then((hash: string) => User.create({
      name,
      email,
      password: hash,
    }))
    .then((user) => {
      const { accessToken, refreshToken, refreshExpiry } = generateTokens(user._id.toString());

      return User.updateOne({ _id: user._id }, { $push: { tokens: { token: refreshToken } } })
        .then(() => {
          setRefreshCookie(res, refreshToken, refreshExpiry);

          return res.status(201).json(authResponse(user, accessToken));
        });
    })
    .catch((error) => next(error));
};

export const getCurrentUser = (req: Request, res: Response, next: NextFunction) => {
  const currentUser = req.user;

  if (!currentUser) {
    return next(new UnauthorizedError('Ошибка авторизации'));
  }

  return User.findById(currentUser._id).then((user) => {
    if (!user) {
      return next(new NotFoundError('Пользователя не существует'));
    }

    return res.status(200).json({ user: { email: user.email, name: user.name }, success: true });
  })
    .catch((error) => next(error));
};

export const login = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const { accessToken, refreshToken, refreshExpiry } = generateTokens(user._id.toString());

      return User.updateOne({ _id: user._id }, { $push: { tokens: { token: refreshToken } } })
        .then(() => {
          setRefreshCookie(res, refreshToken, refreshExpiry);

          return res.status(200).json(authResponse(user, accessToken));
        });
    })
    .catch((error) => {
      if (error instanceof Error && error.message === 'Неправильная почта или пароль') {
        return next(new UnauthorizedError(error.message));
      }

      return next(error);
    });
};

export const refreshAccessToken = (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return next(new UnauthorizedError('Требуется refresh-токен'));
  }

  let payload: JwtPayload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    return next(new UnauthorizedError('Невалидный refresh-токен'));
  }

  return User.findOne({ _id: payload._id, 'tokens.token': refreshToken })
    .then((user) => {
      if (!user) {
        return Promise.reject(new UnauthorizedError('Пользователь не найден'));
      }

      const tokens = generateTokens(user._id.toString());

      return User.updateOne({ _id: user._id }, { $pull: { tokens: { token: refreshToken } } })
        .then(() => User.updateOne(
          { _id: user._id },
          { $push: { tokens: { token: tokens.refreshToken } } },
        ))
        .then(() => {
          setRefreshCookie(res, tokens.refreshToken, tokens.refreshExpiry);

          return res.status(200).json(authResponse(user, tokens.accessToken));
        });
    })
    .catch((error) => next(error));
};

export const logout = (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return next(new BadRequestError('Требуется refresh-токен'));
  }

  let payload: JwtPayload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    return next(new BadRequestError('Невалидный refresh-токен'));
  }

  if (!mongoose.isValidObjectId(payload._id)) {
    return next(new BadRequestError('Невалидный идентификатор пользователя'));
  }

  return User.findById(payload._id)
    .then((user) => {
      if (!user) {
        return Promise.reject(new NotFoundError('Пользователь не найден'));
      }

      return User.updateOne({ _id: user._id }, { $pull: { tokens: { token: refreshToken } } })
        .then(() => {
          res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/',
          });

          return res.status(200).json({ success: true });
        });
    })
    .catch((error) => next(error));
};
