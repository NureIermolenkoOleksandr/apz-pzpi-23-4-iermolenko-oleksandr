import { prisma } from '../config/db.js';

export const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
      createdAt: true,
      accessKeys: {
        where: { isActive: true },
        select: {
          id: true,
          validFrom: true,
          validTo: true,
          isActive: true,
          device: {
            select: { name: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const updateUser = async (userId, data) => {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      role: data.role !== undefined ? data.role : undefined,
      isActive: data.isActive !== undefined ? data.isActive : undefined,
      fullName: data.fullName !== undefined ? data.fullName : undefined
    }
  });
};

export const deleteUser = async (userId) => {
  return await prisma.user.delete({
    where: { id: userId }
  });
};