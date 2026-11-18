import { Router } from 'express';
import { makeOrder } from '../controllers/orderController';
import { validateCreateOrderBody } from '../middlewares/validators';

const router = Router();
router.post('/', validateCreateOrderBody, makeOrder);
export default router;
