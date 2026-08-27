import express from 'express';
import multer from 'multer';
import * as backupController from '../controllers/backupController.js';
import { authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 } 
});

/**
 * @swagger
 * tags:
 *   name: System
 *   description: System settings and backups
 */

/**
 * @swagger
 * /backups/export:
 *   get:
 *     summary: Download database backup (JSON)
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: JSON file with all data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       403:
 *         description: SUPER_ADMIN only
 */
router.get(
  '/export',
  authorize(['SUPER_ADMIN']),
  backupController.downloadBackup
);

/**
 * @swagger
 * /backups/import:
 *   post:
 *     summary: Restore database from backup
 *     description: |
 *       WARNING! This will delete current data and replace it
 *       with data from the uploaded backup file.
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Backup JSON file
 *     responses:
 *       200:
 *         description: Database restored successfully
 *       400:
 *         description: Invalid file
 */
router.post(
  '/import',
  authorize(['SUPER_ADMIN']),
  upload.single('file'),
  backupController.uploadBackup
);

export default router;
