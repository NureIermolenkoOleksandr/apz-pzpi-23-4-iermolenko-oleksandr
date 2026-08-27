import express from 'express';
import * as telemetryController from '../controllers/telemetryController.js';
import { authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Telemetry
 *   description: Collecting and viewing sensor data
 */

/**
 * @swagger
 * /telemetry:
 *   post:
 *     summary: Submit telemetry (For IoT devices or gateways)
 *     tags: [Telemetry]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceId
 *             properties:
 *               deviceId:
 *                 type: string
 *                 format: uuid
 *               voltage:
 *                 type: number
 *                 format: float
 *                 description: Battery voltage (V)
 *                 example: 5.8
 *               percentage:
 *                 type: integer
 *                 description: Calculated battery percentage
 *                 example: 85
 *               signalQuality:
 *                 type: integer
 *                 description: RSSI (signal strength)
 *                 example: -60
 *               payload:
 *                 type: object
 *                 description: Additional sensor data (temperature, humidity, etc.)
 *                 example: { "door": "CLOSED" }
 *     responses:
 *       201:
 *         description: Data saved
 *       400:
 *         description: Validation error
 *       404:
 *         description: Device not found
 */
router.post(
  '/',
  authorize(['SUPER_ADMIN', 'ORG_ADMIN', 'MAINTENANCE']),
  telemetryController.reportTelemetry
);

/**
 * @swagger
 * /telemetry/{deviceId}:
 *   get:
 *     summary: Get device telemetry history
 *     tags: [Telemetry]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Number of records to retrieve
 *     responses:
 *       200:
 *         description: Array of telemetry records
 *       403:
 *         description: Forbidden
 */
router.get(
  '/:deviceId',
  authorize(['SUPER_ADMIN', 'ORG_ADMIN', 'MAINTENANCE']),
  telemetryController.getHistory
);

export default router;
