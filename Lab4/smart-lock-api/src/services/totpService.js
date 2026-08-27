import { authenticator } from 'otplib';
import { prisma } from '../config/db.js';
import * as eventService from './eventService.js';
authenticator.options = { step: 30, digits: 6 };

export const generateDeviceSecret = () => {
  return authenticator.generateSecret(); 
};

export const generateOfflineCode = async (deviceId, userId) => {
  const accessKey = await prisma.accessKey.findFirst({
    where: { 
      deviceId, 
      userId, 
      isActive: true,
      validFrom: { lte: new Date() }
    },
    include: { device: true }
  });

  if (!accessKey) throw new Error('No active access key found');
  if (!accessKey.device.totpSecret) throw new Error('Device does not support TOTP');
  const token = authenticator.generate(accessKey.device.totpSecret);

  const timeRemaining = authenticator.timeRemaining();

  return { code: token, expiresInSeconds: timeRemaining };
};

export const attemptUnlock = async (userId, deviceId, method = 'APP') => {
  const key = await prisma.accessKey.findFirst({
    where: {
      userId,
      deviceId,
      isActive: true,
      validFrom: { lte: new Date() }, 
      OR: [
        { validTo: { gte: new Date() } },
        { validTo: null }               
      ]
    },
    include: {
        device: true
    }
  });

  if (!key) {
    await eventService.createLog({
      deviceId,
      userId,
      eventType: 'ACCESS_DENIED',
      authMethod: method,
      metadata: { reason: 'No active key or expired' }
    });
    
    throw new Error('Access Denied: No valid key found');
  }

  await eventService.createLog({
    deviceId,
    userId,
    eventType: 'ACCESS_GRANTED',
    authMethod: method,
    metadata: { keyId: key.id }
  });

 
  return { 
    success: true, 
    message: 'Door unlocked successfully', 
    device: key.device.name 
  };

};

export const verifyCode = (token, secret) => {
  try {

    return authenticator.check(token, secret);
  } catch (err) {
    console.error('TOTP Check Error:', err);
    return false;
  }
};