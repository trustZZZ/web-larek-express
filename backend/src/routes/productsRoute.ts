import { Router } from 'express';
import {
  getProducts, createProduct, getProductById, updateProduct, deleteProduct,
} from '../controllers/productsController';
import { validateCreateProductBody, validatePatchProductBody, validateProductIdParam } from '../middlewares/validators';
import auth from '../middlewares/auth';

const router = Router();

router.get('/', getProducts);
router.get('/:productId', validateProductIdParam, getProductById);
router.post('/', auth, validateCreateProductBody, createProduct);
router.patch('/:productId', auth, validateProductIdParam, validatePatchProductBody, updateProduct);
router.delete('/:productId', auth, validateProductIdParam, deleteProduct);
export default router;
