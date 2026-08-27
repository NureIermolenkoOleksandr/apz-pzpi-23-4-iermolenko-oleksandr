import { prisma } from '../config/db.js';

export const addTelemetry = async (data) => {
  return await prisma.telemetry.create({
    data: {
      deviceId: data.deviceId,
      voltage: data.voltage,
      percentage: data.percentage,
      signalQuality: data.signalQuality,
      payload: data.payload || {}, 
    }
  });
};

export const getDeviceTelemetry = async (deviceId, limit = 100) => {
  return await prisma.telemetry.findMany({
    where: { deviceId },
    orderBy: { timestamp: 'desc' },
    take: parseInt(limit)
  });
};