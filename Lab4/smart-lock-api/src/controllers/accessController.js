import * as accessService from '../services/accessService.js';
import * as totpService from '../services/totpService.js';
import * as mqttService from '../services/mqttService.js';
import * as eventService from '../services/eventService.js'; 
import { prisma } from '../config/db.js';

export const issueKey = async (req, res, next) => {
  try {
    const { userId, deviceId, validFrom } = req.body;
    if (!userId || !deviceId || !validFrom) {
      return res.status(400).json({ error: 'userId, deviceId and validFrom are required' });
    }
    const key = await accessService.issueKey(req.body);
    res.status(201).json(key);
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};

export const getMyKeys = async (req, res, next) => {
  try {
    const keys = await accessService.getUserKeys(req.user.id);
    res.json(keys);
  } catch (error) {
    next(error);
  }
};

export const revokeKey = async (req, res, next) => {
  try {
    const { id } = req.params;
    await accessService.revokeKey(id);
    res.status(200).json({ message: 'Key revoked successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Key not found' });
    }
    next(error);
  }
};

export const unlockDoor = async (req, res, next) => {
  try {
    const { deviceId } = req.body;
    const userId = req.user.id;

    if (!deviceId) {
      return res.status(400).json({ error: 'deviceId is required' });
    }

    const result = await accessService.attemptUnlock(userId, deviceId, 'REMOTE_APP');
    res.json(result);

  } catch (error) {
    if (error.message.startsWith('Access Denied')) {
      return res.status(403).json({ error: error.message });
    }
    next(error);
  }
};

export const verifyPinAndUnlock = async (req, res, next) => {
  try {
    const { deviceId, code } = req.body;
    const userId = req.user.id;

    if (!deviceId || !code) {
      return res.status(400).json({ error: 'Device ID and Code are required' });
    }

    const key = await prisma.accessKey.findFirst({
      where: {
        userId,
        deviceId,
        isActive: true,
        validFrom: { lte: new Date() },
        OR: [{ validTo: { gte: new Date() } }, { validTo: null }]
      },
      include: { device: true }
    });

    if (!key) {
      return res.status(403).json({ error: 'Access Denied: No active key found' });
    }

    const secret = key.device.totpSecret;
    if (!secret) {
      return res.status(400).json({ error: 'Device does not support PIN codes' });
    }

    const isValid = totpService.verifyCode(code, secret);

    if (!isValid) {
      console.log(`Failed PIN attempt for user ${userId} on device ${deviceId}`);
  
      await eventService.createLog({
        deviceId,
        userId,
        eventType: 'ACCESS_DENIED',
        authMethod: 'TOTP_PIN',
        metadata: { reason: 'Invalid PIN code' }
      });

      return res.status(401).json({ error: 'Invalid or expired PIN code' });
    }

    console.log(`Valid PIN! Opening door...`);
  
   
    mqttService.sendCommand(key.device.serialNumber, 'OPEN');

  
    await eventService.createLog({
      deviceId: deviceId,
      userId: userId,
      eventType: 'ACCESS_GRANTED',
      authMethod: 'TOTP_PIN',
      metadata: { keyId: key.id }
    });
    
    res.json({ success: true, message: 'PIN verified. Door unlocking...' });

  } catch (error) {
    next(error);
  }
};