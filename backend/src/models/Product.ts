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
  title: { type: String, required: true, unique: true },
  image: { type: Object, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: false },
});

export default mongoose.model<IProduct>('product', productSchema);
