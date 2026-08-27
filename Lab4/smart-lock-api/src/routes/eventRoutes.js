import express from 'express';
import * as eventController from '../controllers/eventController.js';
import { authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: AuditLogs
 *   description: Security event logs
 */

/**
 * @swagger
 * /logs:
 *   get:
 *     summary: View event logs (with filtering)
 *     tags: [AuditLogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: deviceId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [ACCESS_GRANTED, ACCESS_DENIED, DOOR_FORCED, ANOMALY_DETECTED]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start of the period (ISO 8601)
 *     responses:
 *       200:
 *         description: List of events
 *       403:
 *         description: Only accessible by Security or Admin
 */
router.get(
  '/',
  authorize(['SUPER_ADMIN', 'ORG_ADMIN', 'SECURITY']),
  eventController.getAuditLogs
);

export default router;
