import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';

import authRoutes from './authRoutes.js';
import buildingRoutes from './buildingRoutes.js';
import roomRoutes from './roomRoutes.js';
import deviceRoutes from './deviceRoutes.js';
import accessRoutes from './accessRoutes.js';
import userRoutes from './userRoutes.js';
import telemetryRoutes from './telemetryRoutes.js'; 
import eventRoutes from './eventRoutes.js';         
import analyticsRoutes from './analyticsRoutes.js';
import alertRoutes from './alertRoutes.js'; 
import backupRoutes from './backupRoutes.js';
import dashboardRoutes from './dashboardRoutes.js'; 
const router = express.Router();

router.use('/auth', authRoutes);

router.use('/buildings', authenticate, buildingRoutes);
router.use('/rooms', authenticate, roomRoutes);
router.use('/devices', authenticate, deviceRoutes);
router.use('/access-keys', authenticate, accessRoutes);
router.use('/users', authenticate, userRoutes);

router.use('/telemetry', authenticate, telemetryRoutes);
router.use('/logs', authenticate, eventRoutes);
router.use('/analytics', authenticate, analyticsRoutes);

router.use('/backups', authenticate, backupRoutes);
router.use('/alerts', authenticate, alertRoutes);
router.use('/dashboard', authenticate, dashboardRoutes)
export default router;