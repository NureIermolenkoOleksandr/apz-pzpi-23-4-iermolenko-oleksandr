import { prisma } from '../config/db.js';

export const getAllBuildings = async () => {
  return await prisma.building.findMany({
    include: {
      rooms: true, 
      manager: {
        select: { fullName: true, email: true } 
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const getBuildingById = async (id) => {
  return await prisma.building.findUnique({
    where: { id },
    include: { rooms: true }
  });
};

export const createBuilding = async (data) => {
  return await prisma.building.create({
    data: {
      name: data.name,
      address: data.address,
      description: data.description,
      manager: data.managerId ? { connect: { id: data.managerId } } : undefined
    }
  });
};

export const updateBuilding = async (id, data) => {
  return await prisma.building.update({
    where: { id },
    data: {
      name: data.name !== undefined ? data.name : undefined,
      address: data.address !== undefined ? data.address : undefined,
      description: data.description !== undefined ? data.description : undefined,
      manager: data.managerId ? { connect: { id: data.managerId } } : undefined
    }
  });
};

export const deleteBuilding = async (id) => {
  return await prisma.building.delete({
    where: { id }
  });
};