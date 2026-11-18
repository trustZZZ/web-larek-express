import { NextFunction, Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import Product from '../models/Product';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';
import BadRequestError from '../errors/bad-request-error';

const PUBLIC_IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');
const TEMP_DIR = path.join(__dirname, '../../uploads/temp');

const moveImageFromTmp = (fileName: string) => {
  const file = path.basename(fileName);
  const source = path.join(TEMP_DIR, file);
  const target = path.join(PUBLIC_IMAGES_DIR, file);

  if (!existsSync(source)) {
    return Promise.resolve();
  }

  return fs.rename(source, target);
};

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
      return res.json({ product });
    })
    .catch((error) => next(error));
};

export const updateProduct = (req: Request, res: Response, next: NextFunction) => {
  const {
    description, image, title, category, price,
  } = req.body;

  const id = req.params.productId;
  const moveImage = image && image.fileName
    ? moveImageFromTmp(image.fileName)
    : Promise.resolve();

  const userData = Object.fromEntries(
    Object.entries({
      description, title, category, price, image,
    })
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
    .catch((error) => next(error));
};

export const deleteProduct = (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.productId;
  Product.findByIdAndDelete(id, { returnDocument: 'before' })
    .then((product) => {
      if (!product) {
        return next(new NotFoundError('Товар не найден'));
      }
      return res.status(200).json(product);
    })
    .catch((error) => next(error));
};

export const createProduct = (req: Request, res: Response, next: NextFunction) => {
  const {
    description, image, title, category, price,
  } = req.body;

  if (!image || !image.fileName) {
    return next(new BadRequestError('Поле "image" должно быть заполнено'));
  }

  return moveImageFromTmp(image.fileName)
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

      return next(error);
    });
};
