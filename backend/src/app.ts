import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import router from './routes/products';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = 3000;
const DB_URL = 'mongodb://127.0.0.1:27017/weblarek';

mongoose.connect(DB_URL);

app.use('/products', router);

app.use(express.static(path.join(__dirname, 'public')));
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
