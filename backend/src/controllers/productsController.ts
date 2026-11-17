import { NextFunction, Request, Response } from 'express';
import Product from '../models/Product';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';
import fs from 'fs/promises';
import path from 'path';
import BadRequestError from '../errors/bad-request-error';

export const getProducts = (req: Request, res: Response, next: NextFunction) => {
  Product.find({})
    .then((products) => res.json({ item: products, total: products.length }))
    .catch((error) => next(error));
};

export const getProductById = (req: Request, res: Response, next: NextFunction) => {
  Product.findById(req.params.productId)
    .then((product) => {
      if (!product) {
        return next(new NotFoundError('Товар не найден'));
      }
      return res.json({ product })
    })
    .catch((error) => { return next(error) });
}

export const updateProduct = (req: Request, res: Response, next: NextFunction) => {
  const {
    description, image, title, category, price,
  } = req.body;

  const id = req.params.productId;
  const moveImage = image && image.fileName
    ? fs.rename(path.join(__dirname, '../../uploads/temp', path.basename(image.fileName)), path.join(__dirname, '../../public', image.fileName))
    : Promise.resolve();

  const userData = Object.fromEntries(
    Object.entries({ description, title, category, price, image })
      .filter(([, value]) => value !== undefined),
  );

  return moveImage
    .then(() => Product.findByIdAndUpdate(id, userData, { new: true, runValidators: true }))
    .then((product) => {
      if (!product) {
        return next(new NotFoundError('Товар не найден'));
      }

      return res.json(product);
    })
    .catch((error) => {
      return next(error);
    });
}

export const deleteProduct = (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.productId;
  Product.findByIdAndDelete(id, { returnDocument: 'before' })
    .then((product) => {
      if (!product) {
        return next(new NotFoundError('Товар не найден'))
      }
      return res.status(200).json(product);
    })
    .catch((error) => {
      return next(error);
    })
}

export const createProduct = (req: Request, res: Response, next: NextFunction) => {
  const {
    description, image, title, category, price,
  } = req.body;

  if (!image || !image.fileName) {
    return next(new BadRequestError('Поле "image" должно быть заполнено'));
  }

  const FINAL_DIR = path.join(__dirname, '../../public', image.fileName);
  const TEMP_DIR = path.join(__dirname, '../../uploads/temp', path.basename(image.fileName));

  return fs.rename(TEMP_DIR, FINAL_DIR)
    .then(() => Product.create({
      description,
      image,
      title,
      category,
      price,
    }))
    .then((product) => res.status(201).json(product))
    .catch((error) => {
      if (error instanceof Error && error.message.includes('E11000')) {
        return next(new ConflictError('Объект с таким названием уже существует'));
      }

      if (error instanceof Error && error.message.includes('ENOENT')) {
        return next(new BadRequestError('Файл изображения не найден, загрузите его заново'));
      }

      return next(error);
    });
};
