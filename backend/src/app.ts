import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import cookieParser from 'cookie-parser';

import router from './routes/productsRoute';
import orderRouter from './routes/orderRoute';
import authRouter from './routes/authRoute';
import uploadRouter from './routes/uploadRoute';


import { errors } from 'celebrate';
import { errorHandler } from './middlewares/errorHandler';
import { requestLogger, errorLogger } from './middlewares/logger';

import NotFoundError from './errors/not-found-error';

import { startCleanupJob } from './jobs/cleanup';

const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const PORT = 3000;
const DB_URL = 'mongodb://127.0.0.1:27017/weblarek';

mongoose.connect(DB_URL);

app.use(requestLogger);

app.use('/product', router);
app.use('/order', orderRouter);
app.use('/auth', authRouter);
app.use('/upload', uploadRouter);

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use((req, res, next) => {
  next(new NotFoundError('Маршрут не найден'));
});


app.use(errors());       
app.use(errorLogger);    
app.use(errorHandler);   

startCleanupJob();

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});