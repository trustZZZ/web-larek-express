import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { errors } from 'celebrate';
import process from 'process';
import { mkdirSync } from 'fs';
import productRouter from './routes/productsRoute';
import orderRouter from './routes/orderRoute';
import authRouter from './routes/authRoute';
import uploadRouter from './routes/uploadRoute';

import { errorHandler } from './middlewares/errorHandler';
import { requestLogger, errorLogger } from './middlewares/logger';
import NotFoundError from './errors/not-found-error';

import { startCleanupJob } from './jobs/cleanup';

dotenv.config();

const PUBLIC_IMAGES_DIR = path.join(__dirname, 'public', process.env.UPLOAD_PATH || 'images');

mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true });

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DB_ADDRESS || 'mongodb://127.0.0.1:27017/weblarek';

const connectWithRetry = (attempt = 1) => {
  mongoose.connect(DB_URL)
    .then(() => {
      startCleanupJob();
    })
    .catch((error) => {
      console.error(`Ошибка подключения к базе (попытка ${attempt}):`, error.message);

      setTimeout(() => connectWithRetry(attempt + 1), 3000);
    });
};

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

connectWithRetry();

app.use(requestLogger);

app.use('/product', productRouter);
app.use('/order', orderRouter);
app.use('/auth', authRouter);
app.use('/upload', uploadRouter);

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  next(new NotFoundError('Маршрут не найден'));
});

app.use(errors());
app.use(errorLogger);
app.use(errorHandler);
