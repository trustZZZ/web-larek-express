# Шаг 4. Валидация данных — что ещё не сделано

| Задание (что ещё не сделано) | Что сделать | Путь до файла |
|---|---|---|
| Валидация body при создании товара через celebrate | обернуть роут: `router.post('/', celebrate({ body: Joi.object().required().keys({ title: Joi.string().min(2).max(30).required(), description: Joi.string().min(2).required(), category: Joi.string().required(), price: Joi.number().min(0), image: Joi.object({ filename: Joi.string().required(), originalName: Joi.string().required() }).required() }) }), createProduct)` | `backend/src/routes/products.ts` |
| Сообщения и ограничения длины у `title` | `required: [true, 'Поле "title" должно быть заполнено'], minlength: [2, 'Минимальная длина поля "title" - 2'], maxlength: [30, 'Максимальная длина поля "title" - 30']` | `backend/src/models/Product.ts` |
| Валидация `description` | `required: [true, 'Поле "description" должно быть заполнено'], minlength: [2, '…'], maxlength: [200, '…']` | `backend/src/models/Product.ts` |
| Валидация `category` | `required: [true, '…']` + `enum: { values: [/* реальные категории проекта */], message: '…' }` | `backend/src/models/Product.ts` |
| Валидация `price` | `min: [0, 'Цена не может быть отрицательной']`; `required: false` оставить — товар может быть «не продаётся» | `backend/src/models/Product.ts` |
| Структурная валидация `image` | вместо `type: Object` — подсхема: `image: { filename: { type: String, required: [true, '…'] }, originalName: { type: String, required: [true, '…'] } }`, иначе принимается любой объект | `backend/src/models/Product.ts` |
| Валидация параметров URL (`id`) | роутов с `:id` в API пока нет; при добавлении `GET/PATCH/DELETE /product/:id` — `celebrate({ params: Joi.object({ id: Joi.string().hex().length(24).required() }) })` **до** валидации body | `backend/src/routes/products.ts` |
| Валидация заголовков | заголовки в API не читаются — валидировать нечего | — |
| Сообщения об ошибках в схеме | заменить `required: true` на массив `[true, 'текст']` во всех полях — иначе клиент получает английский текст mongoose | `backend/src/models/Product.ts` |
