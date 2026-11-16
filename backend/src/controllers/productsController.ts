import { NextFunction, Request, Response } from 'express';
import Product from '../models/Product';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';

export const getProducts = (req: Request, res: Response, next: NextFunction) => {
  Product.find({})
    .then((products) => { res.json({ item: products, total: products.length }) })
    .catch((error) => {
      return next(error)
    })
};

export const getProductById = (req: Request, res: Response, next: NextFunction) => {
  Product.findById(req.params.id)
    .then((product) => {
      if (!product) {
        return next(new NotFoundError('Товар не найден'));
      }
      return res.json({ product })
    })
    .catch((error) => { return next(error) });
}

export const createProduct = (req: Request, res: Response, next: NextFunction) => {
  const {
    description, image, title, category, price,
  } = req.body;
  Product.create({
    description,
    image,
    title,
    category,
    price,
  })
    .then((product) => res.json(product))
    .catch((error) => {
      if (error instanceof Error && error.message.includes('E11000')) {
        return next(new ConflictError('Объект с таким названием уже существует'));
      }
      next(error);
    });
};
