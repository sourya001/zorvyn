import express from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/roles.js';
import { validateCreateUser, validateUpdateUser } from '../validators/user.js';

const router = express.Router();

router.use(authenticate);
router.post('/', authorize('admin'), validateCreateUser, userController.createUser);
router.get('/', authorize('admin'), userController.listUsers);
router.get('/:id', authorize('admin', 'analyst', 'viewer'), userController.getUserById);
router.patch('/:id', authorize('admin'), validateUpdateUser, userController.updateUser);
router.delete('/:id', authorize('admin'), userController.deactivateUser);

export default router;
