import { prisma } from '../config/db.js';

export const createRoom = async (data) => {
  return await prisma.room.create({
    data: {
      name: data.name,
      floorNumber: parseInt(data.floorNumber), 
      areaSqm: data.areaSqm ? parseFloat(data.areaSqm) : null,
      building: { connect: { id: data.buildingId } }
    }
  });
};

export const getRoomsByBuilding = async (buildingId) => {
  return await prisma.room.findMany({
    where: { buildingId },
    include: { devices: true } 
  });
};

export const getRoomById = async (id) => {
  return await prisma.room.findUnique({
    where: { id },
    include: { devices: true }
  });
};

export const updateRoom = async (id, data) => {
  return await prisma.room.update({
    where: { id },
    data: {
      name: data.name !== undefined ? data.name : undefined,
      floorNumber: data.floorNumber !== undefined ? parseInt(data.floorNumber) : undefined,
      areaSqm: data.areaSqm !== undefined ? parseFloat(data.areaSqm) : undefined,
      building: data.buildingId ? { connect: { id: data.buildingId } } : undefined
    }
  });
};

export const deleteRoom = async (id) => {
  return await prisma.room.delete({
    where: { id }
  });
};