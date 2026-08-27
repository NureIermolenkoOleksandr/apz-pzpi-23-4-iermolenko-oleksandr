import { prisma } from '../config/db.js';
import * as totpService from './totpService.js';
export const createDevice = async (data) => {
  let secret = data.totpSecret;
  
  if (data.category === 'SMART_LOCK' && !secret) {
    secret = totpService.generateDeviceSecret(); 
  }

  return await prisma.device.create({
    data: {
      serialNumber: data.serialNumber,
      name: data.name,
      category: data.category,
      mqttTopic: data.mqttTopic,
      totpSecret: secret,       
      config: data.config || {},
      room: { connect: { id: data.roomId } }
    }
  });
};

export const getDeviceById = async (id) => {
  return await prisma.device.findUnique({
    where: { id },
    include: {
      room: {
        include: { building: true }
      }
    }
  });
};

export const getBySerial = async (serialNumber) => {
  return await prisma.device.findUnique({
    where: { serialNumber },
    include: { room: true }
  });
};

export const getAllDevices = async (filter = {}) => {
  return await prisma.device.findMany({
    where: filter,
    include: {
      room: {
        include: { building: true }
      }
    }
  });
};



export const updateDevice = async (id, data) => {
  const device = await prisma.device.findUnique({ where: { id } });
  if (!device) throw new Error('Device not found');

  const updatePayload = {};
  if (data.name !== undefined) updatePayload.name = data.name;
  if (data.status !== undefined) updatePayload.status = data.status;
  if (data.batteryLevel !== undefined) updatePayload.batteryLevel = parseInt(data.batteryLevel);
  if (data.config) {
    updatePayload.config = { ...device.config, ...data.config };
  }

  return await prisma.device.update({
    where: { id },
    data: updatePayload
  });
};

export const updateDeviceConfig = async (id, newConfig) => {
  return updateDevice(id, { config: newConfig });
};


export const deleteDevice = async (id) => {
  const device = await prisma.device.findUnique({ where: { id } });
  if (!device) throw new Error('Device not found');

  return await prisma.device.delete({
    where: { id }
  });
};