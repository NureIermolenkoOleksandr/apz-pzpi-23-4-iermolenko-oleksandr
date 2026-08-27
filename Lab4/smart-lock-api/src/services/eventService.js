import { prisma } from '../config/db.js';

export const getLogs = async (filters) => {
  const { deviceId, userId, type, startDate, endDate } = filters;

  const where = {};
  if (deviceId) where.deviceId = deviceId;
  if (userId) where.userId = userId;
  if (type) where.eventType = type;
  
  if (startDate || endDate) {
    where.timestamp = {};
    if (startDate) where.timestamp.gte = new Date(startDate);
    if (endDate) where.timestamp.lte = new Date(endDate);
  }

  return await prisma.eventLog.findMany({
    where,
    include: {
      user: { select: { fullName: true, email: true } },     
      device: { select: { name: true, serialNumber: true } } 
    },
    orderBy: { timestamp: 'desc' },
    take: 200 
  });
};


export const createLog = async (data) => {
  const { deviceId, userId, eventType, authMethod, riskScore, metadata } = data;

  return await prisma.eventLog.create({
    data: {
      eventType,
      authMethod,
      riskScore: riskScore || 0.0,
      metadata: metadata || {},

      device: deviceId ? { connect: { id: deviceId } } : undefined,
      
      user: userId ? { connect: { id: userId } } : undefined
    }
  });
};