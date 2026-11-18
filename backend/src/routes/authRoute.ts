import { Router } from 'express';
import {
  getCurrentUser, login, logout, refreshAccessToken, registerUser,
} from '../controllers/authController';
import auth from '../middlewares/auth';
import { validateLoginBody, validateRegisterBody } from '../middlewares/validators';

const router = Router();

router.post('/login', validateLoginBody, login);
router.post('/register', validateRegisterBody, registerUser);
router.get('/token', refreshAccessToken);
router.get('/logout', logout);
router.get('/user', auth, getCurrentUser);

export default router;
