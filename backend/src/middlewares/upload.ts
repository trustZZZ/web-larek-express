import { Request } from 'express';
import multer from 'multer';
import { randomUUID } from 'crypto';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';
import BadRequestError from '../errors/bad-request-error';

const TMP_DIR = path.join(__dirname, '../../uploads/temp');

if (!existsSync(TMP_DIR)) {
  mkdirSync(TMP_DIR, { recursive: true });
}

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, TMP_DIR),
  filename: (req, file, cb) => cb(null, `${randomUUID()}${path.extname(file.originalname)}`),
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return cb(new BadRequestError('Недопустимый тип файла. Разрешены png, jpeg, gif, webp, svg'));
  }

  return cb(null, true);
};

export const fileMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
