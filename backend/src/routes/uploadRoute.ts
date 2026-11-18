import { Router } from 'express';
import { fileMiddleware } from '../middlewares/upload';
import { uploadFile } from '../controllers/uploadController';
import auth from '../middlewares/auth';

const uploadRouter = Router();

uploadRouter.post('/', auth, fileMiddleware.single('file'), uploadFile);

export default uploadRouter;
