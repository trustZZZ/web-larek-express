import { celebrate, Joi } from 'celebrate';

export const validateIdParam = celebrate(
  {
    params: Joi.object().keys({
      id: Joi.string()
        .required()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
          'string.pattern.base': 'Некорректный формат ID товара',
          'string.empty': 'ID товара обязателен'
        })
    })
  },
  {
    abortEarly: false
  }
);

export const validateCreateProductBody = celebrate(
  {
    body: Joi.object().keys({
      title: Joi.string().min(2).max(30).required(),
      category: Joi.string().valid('софт-скил', 'хард-скил', 'другое', 'дополнительное', 'кнопка').required(),
      price: Joi.number().allow(null).min(0),
      description: Joi.string().min(2).max(300).required(),
      image: Joi.object().optional().keys({
        fileName: Joi.string().required(),
        originalName: Joi.string().required(),
      })
    })
  },
  {
    abortEarly: false
  }
);

export const validateCreateOrderBody = celebrate(
  {
    body: Joi.object().keys({
      items: Joi.array()
        .items(Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/))
        .min(1)
        .required(),
      total: Joi.number().positive().required(),
      payment: Joi.string().valid('card', 'online').required(),
      email: Joi.string().email().required(),
      phone: Joi.string().pattern(/^\+?\d{10,15}$/).required(),
      address: Joi.string().min(5).required()
    })
  },
  {
    abortEarly: false
  }
);