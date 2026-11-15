import { Request, Response } from 'express';
import { faker } from '@faker-js/faker';
import Product from '../models/Product';
import mongoose from 'mongoose';

interface IOrder {
    payment: 'card' | 'online';
    email: string;
    phone: string;
    address: string;
    total: number;
    items: string[];
}

export const makeOrder = (req: Request, res: Response) => {
    const { payment, email, phone, address, total, items }: IOrder = req.body;

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Ошибка: список товаров пуст' });
    }

    const invalidIds = items.filter((id: string) => !mongoose.isValidObjectId(id));

    if (invalidIds.length > 0) {
        return res.status(400).json({
            error: 'Один или несколько ID товаров имеют неверный формат',
            invalid: invalidIds
        });
    }

    if (!['card', 'online'].includes(payment)) {
        return res.status(400).json({ error: 'Ошибка: не задан способ оплаты' });
    }
    if (!email || typeof email !== 'string' || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        return res.status(400).json({ error: 'Некорректный email' });
    }
    if (!phone || typeof phone !== 'string') {
        return res.status(400).json({ error: 'Поле "phone" обязательно и должно быть строкой' });
    }
    if (!address || typeof address !== 'string') {
        return res.status(400).json({ error: 'Поле "address" обязательно и должно быть строкой' });
    }
    if (typeof total !== 'number') {
        return res.status(400).json({ error: 'Поле "total" обязательно и должно быть числом' });
    }

    Promise.all(items.map((itemId) => Product.findById(itemId)))
        .then((products) => {
            let totalPrice = 0;
            for (const product of products) {
                if (!product) {
                    return res.status(400).json({ error: 'Ошибка: нет товаров в БД' });
                }
                if (typeof product.price !== 'number') {
                    return res.status(400).json({ error: 'Ошибка: товар не продается' });
                }
                totalPrice += product.price;
            }
            if (totalPrice !== total) {
                return res.status(400).json({ error: `Ошибка: сумма не соответствует` });
            }
            return res.status(200).json({ id: faker.string.uuid(), total: totalPrice });
        })
        .catch((error) => res.status(500).json({ error: 'Внутренняя ошибка сервера' }));
};
