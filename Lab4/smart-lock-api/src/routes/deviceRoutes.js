import express from 'express';
import * as deviceController from '../controllers/deviceController.js';
import { authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Devices
 *   description: IoT device management
 */

/**
 * @swagger
 * /devices:
 *   get:
 *     summary: Get list of devices
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [SMART_LOCK, DOOR_SENSOR]
 *     responses:
 *       200:
 *         description: Devices retrieved successfully
 *       401:
 *         description: Unauthorized
 *
 *   post:
 *     summary: Register a new device (Admin/Maintenance)
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serialNumber
 *               - roomId
 *             properties:
 *               serialNumber:
 *                 type: string
 *               name:
 *                 type: string
 *               roomId:
 *                 type: string
 *                 format: uuid
 *               category:
 *                 type: string
 *                 enum: [SMART_LOCK, DOOR_SENSOR, GATEWAY]
 *     responses:
 *       201:
 *         description: Device created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden (ADMIN or MAINTENANCE role required)
 *       409:
 *         description: Device with this serial number already exists
 *       500:
 *         description: Server error
 */
router.get('/', deviceController.listDevices);

router.post(
  '/',
  authorize(['SUPER_ADMIN', 'ORG_ADMIN', 'MAINTENANCE']),
  deviceController.createDevice
);

/**
 * @swagger
 * /devices/{id}/config:
 *   put:
 *     summary: Update device configuration
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               config:
 *                 type: object
 *                 example:
 *                   volume: 10
 *                   autoLock: true
 *     responses:
 *       200:
 *         description: Configuration updated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Device not found
 */
router.put(
  '/:id/config',
  authorize(['SUPER_ADMIN', 'ORG_ADMIN', 'MAINTENANCE']),
  deviceController.updateConfig
);

/**
 * @swagger
 * /devices/{id}/open:
 *   post:
 *     summary: Remote door unlock (MQTT command)
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Device UUID
 *     responses:
 *       200:
 *         description: Unlock command sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Device not found
 */
router.post(
  '/:id/open',
  authorize(['SUPER_ADMIN', 'ORG_ADMIN', 'TENANT', 'SECURITY']), 
  deviceController.remoteOpen
);

/**
 * @swagger
 * /devices/{id}/secret:
 *   get:
 *     summary: Get TOTP secret (for firmware or QR code)
 *     tags: [Devices]
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
 *         description: Secret retrieved successfully
 *       403:
 *         description: Super Admin only
 */
router.get(
  '/:id/secret',
  authorize(['SUPER_ADMIN']), 
  deviceController.getDeviceSecret
);

router.patch(
  '/:id',
  authorize(['SUPER_ADMIN', 'ORG_ADMIN', 'MAINTENANCE']),
  deviceController.updateDevice 
);
router.delete(
  '/:id',
  authorize(['SUPER_ADMIN', 'ORG_ADMIN']),
  deviceController.deleteDevice
);
export default router;
