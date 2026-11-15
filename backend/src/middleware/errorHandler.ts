import { Error as MongooseError } from 'mongoose';
import BaseError from "../errors/base-error";
import { Request, Response, NextFunction } from "express";
import BadRequestError from "../errors/bad-request-error";

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {

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

    console.error(error.stack);
    return res.status(500).json({
        message: 'Внутренняя ошибка сервера'
    })
};