import express from 'express';
import * as accessController from '../controllers/accessController.js';
import { authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: AccessKeys
 *   description: Digital access key management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AccessKey:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         validFrom:
 *           type: string
 *           format: date-time
 *         validTo:
 *           type: string
 *           format: date-time
 *         isActive:
 *           type: boolean
 *         userId:
 *           type: string
 *           format: uuid
 *         deviceId:
 *           type: string
 *           format: uuid
 */

/**
 * @swagger
 * /access-keys/issue:
 *   post:
 *     summary: Issue an access key to a user (Manager/Admin only)
 *     tags: [AccessKeys]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - deviceId
 *               - validFrom
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               deviceId:
 *                 type: string
 *                 format: uuid
 *               validFrom:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-20T10:00:00Z"
 *               validTo:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-02-20T18:00:00Z"
 *     responses:
 *       201:
 *         description: Access key successfully issued
 *       400:
 *         description: Invalid data or missing required fields
 *       403:
 *         description: Forbidden (insufficient permissions)
 *       404:
 *         description: User or device not found
 *       500:
 *         description: Internal server error
 */
router.post(
  '/issue',
  authorize(['SUPER_ADMIN', 'ORG_ADMIN', 'MANAGER']),
  accessController.issueKey
);

/**
 * @swagger
 * /access-keys/my:
 *   get:
 *     summary: Get my active access keys
 *     description: Returns a list of access keys for the currently authenticated user.
 *     tags: [AccessKeys]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of access keys
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AccessKey'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/my', accessController.getMyKeys);

/**
 * @swagger
 * /access-keys/{id}:
 *   delete:
 *     summary: Revoke an access key (Soft delete)
 *     tags: [AccessKeys]
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
 *         description: Access key successfully revoked
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Access key not found
 *       500:
 *         description: Server error
 */
router.delete(
  '/:id',
  authorize(['SUPER_ADMIN', 'ORG_ADMIN', 'MANAGER']),
  accessController.revokeKey
);

/**
 * @swagger
 * /access-keys/unlock:
 *   post:
 *     summary: Use access key (unlock door)
 *     description: Verifies the access key, logs the event, and sends a command to unlock the door.
 *     tags: [AccessKeys]
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
 *     responses:
 *       200:
 *         description: Access granted, door unlocked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *       403:
 *         description: Access denied (no valid or expired key)
 *       404:
 *         description: Device not found
 */
router.post('/unlock', accessController.unlockDoor);

/**
 * @swagger
 * /access-keys/verify-pin:
 *   post:
 *     summary: Unlock door using TOTP code
 *     description: Simulates entering a code from a mobile app or keypad.
 *     tags: [AccessKeys]
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
 *               - code
 *             properties:
 *               deviceId:
 *                 type: string
 *                 format: uuid
 *               code:
 *                 type: string
 *                 description: 6-digit TOTP code
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Code is valid, door unlocked
 *       401:
 *         description: Invalid code
 */
router.post(
  '/verify-pin',
  accessController.verifyPinAndUnlock
);

export default router;
