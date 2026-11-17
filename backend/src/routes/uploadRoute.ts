import { fileMiddleware } from '../middlewares/upload';
import { uploadFile } from '../controllers/uploadController';
import { Router } from 'express';
import auth from '../middlewares/auth';

const uploadRouter = Router();

uploadRouter.post('/', auth, fileMiddleware.single('file'), uploadFile);

export default uploadRouter;