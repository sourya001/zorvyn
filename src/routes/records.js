import express from 'express';
import * as recordController from '../controllers/recordController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/roles.js';
import { validateCreateRecord, validateUpdateRecord } from '../validators/record.js';

const router = express.Router();
router.use(authenticate);
router.post('/', authorize('admin'), validateCreateRecord, recordController.createRecord);
router.get('/', authorize('admin', 'analyst', 'viewer'), recordController.listRecords);
router.get('/:id', authorize('admin', 'analyst', 'viewer'), recordController.getRecord);
router.patch('/:id', authorize('admin'), validateUpdateRecord, recordController.updateRecord);
router.delete('/:id', authorize('admin'), recordController.deleteRecord);

export default router;
