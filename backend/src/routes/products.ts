import { Router } from 'express';
import { getProducts, createProduct } from '../controllers/productsController';
import { celebrate, Joi } from 'celebrate';
const router = Router();

router.get('/', getProducts);
router.post('/',
    celebrate({
        body:
            Joi.object().required().keys({
                title:
                    Joi.string().min(2).max(30).required(),
                description:
                    Joi.string().min(2).max(300).required(),
                category:
                    Joi.string().valid('софт-скил', 'хард-скил', 'другое', 'дополнительное', 'кнопка').required(),
                price:
                    Joi.number().allow(null).min(0),
                image:
                    Joi.object(
                        {
                            filename: Joi.string().required(),
                            originalName: Joi.string().required()
                        }
                    ).required()
            })
    }),
    createProduct);

export default router;
