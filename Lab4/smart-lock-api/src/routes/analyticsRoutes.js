import express from 'express';
import * as analyticsController from '../controllers/analyticsController.js';
import { authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Intelligent analysis (AI/ML)
 */

/**
 * @swagger
 * /analytics/battery/{deviceId}:
 *   get:
 *     summary: Battery discharge prediction (Linear Regression)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Prediction obtained
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "Draining"
 *                 daysRemaining:
 *                   type: integer
 *                   example: 14
 *                 predictedFailureDate:
 *                   type: string
 *                   format: date-time
 *       403:
 *         description: Only accessible by Maintenance/Admin
 */
router.get(
  '/battery/:deviceId',
  authorize(['SUPER_ADMIN', 'ORG_ADMIN', 'MAINTENANCE']),
  analyticsController.getBatteryPrediction
);

/**
 * @swagger
 * /analytics/risk/{userId}:
 *   get:
 *     summary: User behavior analysis (Z-Score)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Analysis result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 zScore:
 *                   type: string
 *                   example: "3.5"
 *                 status:
 *                   type: string
 *                   example: "Anomaly (High Activity)"
 *       403:
 *         description: Only accessible by Security/Admin
 */
router.get(
  '/risk/:userId',
  authorize(['SUPER_ADMIN', 'ORG_ADMIN', 'SECURITY']),
  analyticsController.getUserRiskScore
);

export default router;
