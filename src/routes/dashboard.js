import express from 'express';
import * as dashboardController from '../controllers/dashboardController.js';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/roles.js';

const router = express.Router();
router.use(authenticate);
router.get('/summary', authorize('admin', 'analyst'), dashboardController.getSummary);
router.get('/categories', authorize('admin', 'analyst'), dashboardController.getCategoryTotals);
router.get('/recent', authorize('admin', 'analyst'), dashboardController.getRecentActivity);
router.get('/trends', authorize('admin', 'analyst'), dashboardController.getMonthlyTrends);

export default router;
