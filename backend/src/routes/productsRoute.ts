import { Router } from 'express';
import { getProducts, createProduct, getProductById, updateProduct, deleteProduct } from '../controllers/productsController';
import { validateCreateProductBody, validatePatchProductBody, validateProductIdParam } from '../middlewares/validators';
const router = Router();

router.get('/', getProducts);
router.get('/:productId', validateProductIdParam, getProductById);
router.post('/', validateCreateProductBody, createProduct);
router.patch('/:productId', validateProductIdParam, validatePatchProductBody, updateProduct);
router.delete('/:productId', validateProductIdParam, deleteProduct);
export default router;
