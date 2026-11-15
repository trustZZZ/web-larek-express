import { Request, Response } from 'express';
import Product from '../models/Product';

export const getProducts = (req: Request, res: Response) => {
  Product.find({})
    .then((products) => { res.json({item: products, total: products.length}) })
    .catch((error) => {
      res.status(500).json({ error: error instanceof Error ? error.message : error });
    })
};

export const createProduct = (req: Request, res: Response) => {
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
      res.status(500).json({ error: error.message });
    });
};
