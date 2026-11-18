import { Error as MongooseError } from 'mongoose';
import { isCelebrateError } from 'celebrate';
import BaseError from "../errors/base-error";
import { Request, Response, NextFunction } from "express";

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {

    if (isCelebrateError(error)) {
        const details = error.details.get('body')
            ?? error.details.get('params')
            ?? error.details.get('query');

        return res.status(400).json({ message: details?.message ?? 'Ошибка валидации данных' });
    }

    if (error instanceof BaseError) {
        return res.status(error.statusCode).json(
            {
                message: error.message,
            }
        )
    };

    if (error instanceof MongooseError.ValidationError) {
        return res.status(400).json({ message: "Ошибка валидации данных при создании товара" })
    };

    if (error instanceof MongooseError.CastError) {
        return res.status(400).json({ message: 'Некорректный идентификатор' });
    }

    if (error instanceof Error && error.message.includes('E11000')) {
        return res.status(409).json({ message: 'Объект с такими данными уже существует' });
    }

    console.error(error.stack);
    return res.status(500).json({
        message: 'Внутренняя ошибка сервера'
    })
};