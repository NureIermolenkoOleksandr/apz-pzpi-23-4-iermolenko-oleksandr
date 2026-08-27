import express from 'express';
import * as buildingController from '../controllers/buildingController.js';
import { authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Buildings
 *   description: Building and office management
 */

/**
 * @swagger
 * /buildings:
 *   get:
 *     summary: Get list of all buildings (Staff only)
 *     tags: [Buildings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Buildings list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Building'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (staff only)
 *       500:
 *         description: Server error
 *
 *   post:
 *     summary: Create a new building (Admin only)
 *     tags: [Buildings]
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
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Horizon Business Center"
 *               address:
 *                 type: string
 *                 example: "Kyiv, Amosova St. 12"
 *               description:
 *                 type: string
 *               managerId:
 *                 type: string
 *                 format: uuid
 *                 description: Manager ID
 *     responses:
 *       201:
 *         description: Building created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Building'
 *       400:
 *         description: Validation error (missing required fields)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (insufficient permissions)
 *       500:
 *         description: Server error
 */
router.get(
  '/',
  authorize(['SUPER_ADMIN', 'ORG_ADMIN', 'MANAGER', 'MAINTENANCE', 'SECURITY']),
  buildingController.listBuildings
);

router.post(
  '/',
  authorize(['SUPER_ADMIN', 'ORG_ADMIN']),
  buildingController.createBuilding
);

/**
 * @swagger
 * /buildings/{id}:
 *   get:
 *     summary: Get building details by ID
 *     tags: [Buildings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Building UUID
 *     responses:
 *       200:
 *         description: Building details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Building'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Building not found
 *       500:
 *         description: Server error
 */
router.get(
  '/:id',
  // Any authenticated user can view building details
  // (e.g. a tenant wants to see their office address)
  // No authorize() needed here because authenticate runs globally
  buildingController.getBuilding
);


router.patch(
  '/:id',
  authorize(['SUPER_ADMIN', 'ORG_ADMIN']),
  buildingController.updateBuilding
);

router.delete(
  '/:id',
  authorize(['SUPER_ADMIN', 'ORG_ADMIN']),
  buildingController.deleteBuilding
);

export default router;
