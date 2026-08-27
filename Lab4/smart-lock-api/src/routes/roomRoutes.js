import express from 'express';
import * as roomController from '../controllers/roomController.js';
import { authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Rooms
 *   description: Manage rooms inside buildings
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Room:
 *       type: object
 *       required:
 *         - name
 *         - buildingId
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique room identifier
 *         name:
 *           type: string
 *           description: Room name or number
 *         floorNumber:
 *           type: integer
 *           description: Floor number
 *         areaSqm:
 *           type: number
 *           format: float
 *           description: Room area in square meters
 *         isRestricted:
 *           type: boolean
 *           default: false
 *           description: Whether the room is a restricted area
 *         buildingId:
 *           type: string
 *           format: uuid
 *           description: ID of the building the room belongs to
 *         createdAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *         name: "Server Room #2"
 *         floorNumber: 3
 *         areaSqm: 15.5
 *         isRestricted: true
 *         buildingId: "550e8400-e29b-41d4-a716-446655440000"
 *         createdAt: "2024-01-12T10:30:00Z"
 */

/**
 * @swagger
 * /rooms:
 *   get:
 *     summary: Get list of rooms (Staff only)
 *     description: Returns a list of rooms for a specified building.
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: buildingId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the building to fetch rooms for
 *     responses:
 *       200:
 *         description: Rooms list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Room'
 *                   - type: object
 *                     properties:
 *                       devices:
 *                         type: array
 *                         description: List of devices in the room
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             name:
 *                               type: string
 *                             category:
 *                               type: string
 *       400:
 *         description: buildingId is missing
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Staff only)
 *
 *   post:
 *     summary: Add a new room (Admin/Manager)
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - buildingId
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Conference Room A"
 *               buildingId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of an existing building
 *               floorNumber:
 *                 type: integer
 *                 example: 2
 *               areaSqm:
 *                 type: number
 *                 example: 45.0
 *               isRestricted:
 *                 type: boolean
 *                 default: false
 *                 description: Set to true for restricted areas
 *     responses:
 *       201:
 *         description: Room created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 *       400:
 *         description: Validation error or building does not exist
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (insufficient permissions)
 */

router.get(
  '/',
  authorize(['SUPER_ADMIN', 'ORG_ADMIN', 'MANAGER', 'MAINTENANCE', 'SECURITY']),
  roomController.getRooms
);

router.post(
  '/',
  authorize(['SUPER_ADMIN', 'ORG_ADMIN', 'MANAGER']),
  roomController.createRoom
);


router.get(
  '/:id',
  authorize(['SUPER_ADMIN', 'ORG_ADMIN', 'MANAGER', 'MAINTENANCE', 'SECURITY']),
  roomController.getRoomById
);

router.patch(
  '/:id',
  authorize(['SUPER_ADMIN', 'ORG_ADMIN', 'MANAGER']),
  roomController.updateRoom
);


router.delete(
  '/:id',
  authorize(['SUPER_ADMIN', 'ORG_ADMIN', 'MANAGER']),
  roomController.deleteRoom
);

export default router;
