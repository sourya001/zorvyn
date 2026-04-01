import express from 'express';
import { login } from '../controllers/authController.js';
import { validateLogin } from '../validators/auth.js';

const router = express.Router();
router.post('/login', validateLogin, login);

export default router;
