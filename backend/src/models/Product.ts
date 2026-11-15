import mongoose from 'mongoose';

interface IImage {
  filename: string,
  originalName: string
}

interface IProduct {
  title: string,
  image: IImage,
  category: string,
  description: string,
  price: number | null
}

const productSchema = new mongoose.Schema<IProduct>({
  title: {
    type: String,
    required: [true, 'Поле "title" должно быть заполнено'],
    unique: true,
    minlength: [2, 'Минимальная длина поля "title" - 2'],
    maxlength: [30, 'Максимальная длина поля "title" - 30']
  },
  image: {
    type: new mongoose.Schema({
      filename: {
        type: String,
        required: [true, 'Изображение должно содержать поле "filename"']
      },
      originalName: {
        type: String,
        required: [true, 'Изображение должно содержать поле "originalName"']
      }
    }, { _id: false }),
    required: [true, 'Поле "image" должно быть заполнено']
  },
  category: {
    type: String,
    required: [true, 'Поле "category" должно быть заполнено'],
    enum: { values: ['софт-скил', 'хард-скил', 'другое', 'дополнительное', 'кнопка'], message: 'Категория должна быть одной из: софт-скил, хард-скил, другое, дополнительное, кнопка' }
  },
  description: {
    type: String,
    required: [true, 'Поле "description" должно быть заполнено'],
    minlength: [2, 'Минимальная длина поля "description" - 2'],
    maxlength: [300, 'Максимальная длина поля "description" - 300']
  },
  price: {
    type: Number,
    required: false,
    min: [0, 'Цена товара не может быть меньше 0']
  },
});

export default mongoose.model<IProduct>('product', productSchema);
