import { Router } from 'express';
import { getProducts, createProduct, getProductById } from '../controllers/productsController';
import { validateCreateProductBody, validateIdParam } from '../middleware/validators';
const router = Router();

router.get('/', getProducts);
router.get('/:id', validateIdParam, getProductById);
router.post('/', validateCreateProductBody, createProduct);

export default router;
