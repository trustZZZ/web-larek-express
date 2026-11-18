import { celebrate, Joi } from 'celebrate';

export const validateCreateProductBody = celebrate(
  {
    body: Joi.object().keys({
      title: Joi.string().min(2).max(30).required(),
      category: Joi.string().valid('софт-скил', 'хард-скил', 'другое', 'дополнительное', 'кнопка').required(),
      price: Joi.number().allow(null).min(0),
      description: Joi.string().min(2).max(300).required(),
      image: Joi.object().keys({
        fileName: Joi.string().required(),
        originalName: Joi.string().required(),
      }).required(),
    }),
  },
  {
    abortEarly: false,
  },
);

export const validateProductIdParam = celebrate(
  {
    params: Joi.object().keys({
      productId: Joi.string()
        .hex()
        .length(24)
        .required()
        .messages({
          'string.hex': 'Некорректный формат ID товара',
          'string.length': 'ID товара должен состоять из 24 символов',
          'string.empty': 'ID товара обязателен',
        }),
    }),
  },
  {
    abortEarly: false,
  },
);

export const validatePatchProductBody = celebrate(
  {
    body: Joi.object().keys({
      title: Joi.string().min(2).max(30).optional(),
      category: Joi.string().valid('софт-скил', 'хард-скил', 'другое', 'дополнительное', 'кнопка').optional(),
      price: Joi.number().allow(null).min(0).optional(),
      description: Joi.string().min(2).max(300).optional(),
      image: Joi.object().keys({
        fileName: Joi.string().required(),
        originalName: Joi.string().required(),
      }),
    }),
  },
  {
    abortEarly: false,
  },
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
      address: Joi.string().min(5).required(),
    }),
  },
  {
    abortEarly: false,
  },
);

export const validateLoginBody = celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
});

export const validateRegisterBody = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
});
