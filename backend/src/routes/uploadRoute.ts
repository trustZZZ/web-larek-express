import { fileMiddleware } from '../middlewares/upload';
import { uploadFile } from '../controllers/uploadController';
import { Router } from 'express';

const uploadRouter = Router();

uploadRouter.post('/', fileMiddleware.single('file'), uploadFile); 

export default uploadRouter;