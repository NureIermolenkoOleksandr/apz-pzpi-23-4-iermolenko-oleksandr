import express from 'express';
import * as alertController from '../controllers/alertController.js';
import { authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Alerts
 *   description: Critical event notification system
 */

/**
 * @swagger
 * /alerts:
 *   get:
 *     summary: Get list of alerts
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [NEW, SENT, READ]
 *         description: Filter by alert status
 *     responses:
 *       200:
 *         description: List of alerts
 *       403:
 *         description: Only accessible by staff (Admin/Maintenance/Security)
 */
router.get(
  '/',
  authorize(['SUPER_ADMIN', 'ORG_ADMIN', 'MAINTENANCE', 'SECURITY']),
  alertController.getAlerts
);

/**
 * @swagger
 * /alerts/{id}/read:
 *   patch:
 *     summary: Mark alert as read
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch(
  '/:id/read',
  authorize(['SUPER_ADMIN', 'ORG_ADMIN', 'MAINTENANCE', 'SECURITY']),
  alertController.markRead
);

export default router;
