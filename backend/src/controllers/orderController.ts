import { NextFunction, Request, Response } from 'express';
import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import Product from '../models/Product';
import BadRequestError from '../errors/bad-request-error';

interface IOrder {
    payment: 'card' | 'online';
    email: string;
    phone: string;
    address: string;
    total: number;
    items: string[];
}

export const makeOrder = (req: Request, res: Response, next: NextFunction) => {
  const {
    payment, email, phone, address, total, items,
  }: IOrder = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return next(new BadRequestError('Ошибка валидации данных при создании заказа'));
  }

  const invalidIds = items.filter((id: string) => !mongoose.isValidObjectId(id));

  if (invalidIds.length > 0) {
    return next(new BadRequestError('Ошибка валидации данных при создании заказа'));
  }

  if (!['card', 'online'].includes(payment)) {
    return next(new BadRequestError('Ошибка валидации данных при создании заказа'));
  }
  if (!email || typeof email !== 'string' || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    return next(new BadRequestError('Ошибка валидации данных при создании заказа'));
  }
  if (!phone || typeof phone !== 'string') {
    return next(new BadRequestError('Ошибка валидации данных при создании заказа'));
  }
  if (!address || typeof address !== 'string') {
    return next(new BadRequestError('Ошибка валидации данных при создании заказа'));
  }
  if (typeof total !== 'number') {
    return next(new BadRequestError('Ошибка валидации данных при создании заказа'));
  }

  Promise.all(items.map((itemId) => Product.findById(itemId)))
    .then((products) => {
      let totalPrice = 0;
      for (const product of products) {
        if (!product) {
          return next(new BadRequestError('Ошибка валидации данных при создании заказа'));
        }
        if (typeof product.price !== 'number') {
          return next(new BadRequestError('Ошибка валидации данных при создании заказа'));
        }
        totalPrice += product.price;
      }
      if (totalPrice !== total) {
        return next(new BadRequestError('Ошибка валидации данных при создании заказа'));
      }
      return res.status(200).json({ id: faker.string.uuid(), total: totalPrice });
    })
    .catch((error) => next(error));
};
