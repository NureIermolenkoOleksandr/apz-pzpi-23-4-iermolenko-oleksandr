import express from 'express';
import * as userController from '../controllers/userController.js';
import { authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User administration (Admin only)
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get list of all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Forbidden (Admin only)
 *       500:
 *         description: Server error
 */
router.get(
  '/',
  authorize(['SUPER_ADMIN', 'ORG_ADMIN']),
  userController.listUsers
);

/**
 * @swagger
 * /users/{id}/role:
 *   patch:
 *     summary: Change a user's role
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [SUPER_ADMIN, ORG_ADMIN, MANAGER, TENANT, SECURITY]
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       400:
 *         description: Invalid role
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */
router.patch(
  '/:id/role',
  authorize(['SUPER_ADMIN']),
  userController.changeRole
);




router.put(
  '/:id', 
  authorize(['SUPER_ADMIN', 'ORG_ADMIN']), 
  userController.updateUser
);

router.delete(
  '/:id', 
  authorize(['SUPER_ADMIN']), 
  userController.deleteUser
);

export default router;
