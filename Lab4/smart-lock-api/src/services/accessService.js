import { prisma } from '../config/db.js';
import * as eventService from './eventService.js';

export const issueKey = async (data) => {

  const user = await prisma.user.findUnique({ where: { id: data.userId } });
  const device = await prisma.device.findUnique({ where: { id: data.deviceId } });

  if (!user) throw new Error('User not found');
  if (!device) throw new Error('Device not found');

  return await prisma.accessKey.create({
    data: {
      userId: data.userId,
      deviceId: data.deviceId,
      validFrom: new Date(data.validFrom),
      validTo: data.validTo ? new Date(data.validTo) : null,
      isActive: true
    },
    include: {
      user: { select: { fullName: true, email: true } },
      device: { select: { name: true, serialNumber: true } }
    }
  });
};

export const getUserKeys = async (userId) => {
  return await prisma.accessKey.findMany({
    where: { 
      userId,
      isActive: true,
      OR: [
        { validTo: { gte: new Date() } },
        { validTo: null }
      ]
    },
    include: {
      device: {
        select: { 
            id: true, 
            name: true, 
            serialNumber: true,
            totpSecret: true, 
            room: { 
              select: { 
                name: true,
                building: { select: { name: true } } 
              } 
            } 
        }
      }
    }
  });
};

export const revokeKey = async (keyId) => {
  return await prisma.accessKey.update({
    where: { id: keyId },
    data: { isActive: false }
  });
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
    device: key.device.name,
    serialNumber: key.device.serialNumber 
  };
};