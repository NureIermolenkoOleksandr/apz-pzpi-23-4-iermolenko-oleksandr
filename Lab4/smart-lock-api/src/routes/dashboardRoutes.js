import express from 'express';
import * as dashboardController from '../controllers/dashboardController.js';
import { authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Aggregated statistics (role-based)
 */

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     description: >
 *       Returns different data structures depending on the user role
 *       (Admin, Manager, Tenant, etc.).
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  dashboardController.getDashboard
);

export default router;
