import { Router } from 'express';
import { makeOrder } from '../controllers/orderController';
import { celebrate, Joi } from 'celebrate';

const router = Router();

router.post(
  '/',
  celebrate({
    body: Joi.object().required().keys({
      items: Joi.array().items(Joi.string().required()).min(1).required(),
      total: Joi.number().positive().required(),
      payment: Joi.string().valid('card', 'online').required(),
      email: Joi.string().email().required(),
      phone: Joi.string().pattern(/^\+?\d{10,15}$/).required(),
      address: Joi.string().min(5).required(),
    }),
  }),
  makeOrder
);

export default router;
