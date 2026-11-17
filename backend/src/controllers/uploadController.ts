import { NextFunction, Request, Response } from 'express';
import BadRequestError from '../errors/bad-request-error';

export const uploadFile = (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
        return next(new BadRequestError('Файл не передан'));
    }
    const fileName = req.file.filename;
    const originalName = req.file.originalname

    return res.status(200).json({
        fileName: `/images/${fileName}`,
        originalName: originalName,
    })
}
