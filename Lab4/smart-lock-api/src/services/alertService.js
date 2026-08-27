import { prisma } from '../config/db.js';


export const getAlerts = async (status) => {
  const where = {};
  if (status) where.status = status;

  return await prisma.alert.findMany({
    where,
    include: {
      device: {
        select: { name: true, serialNumber: true, room: { select: { name: true } } }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};


export const createAlert = async (data) => {
  return await prisma.alert.create({
    data: {
      type: data.type,
      message: data.message,
      deviceId: data.deviceId,
      status: 'NEW'
    }
  });
};

export const markAsRead = async (id) => {
  return await prisma.alert.update({
    where: { id },
    data: { status: 'READ' }
  });
};