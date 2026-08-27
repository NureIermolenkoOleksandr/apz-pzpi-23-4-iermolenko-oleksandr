import { prisma } from '../config/db.js';

export const createBackup = async () => {
  const backup = {
    metadata: {
      version: '1.0',
      timestamp: new Date(),
      type: 'FULL_BACKUP'
    },
    data: {
      users: await prisma.user.findMany(),
      buildings: await prisma.building.findMany(),
      rooms: await prisma.room.findMany(),
      devices: await prisma.device.findMany(),
      accessKeys: await prisma.accessKey.findMany(),
      eventLogs: await prisma.eventLog.findMany(),
      telemetry: await prisma.telemetry.findMany(),
      alerts: await prisma.alert.findMany()
    }
  };
  return backup;
};

export const restoreBackup = async (backupData) => {
  const { data } = backupData;

  if (!data || !data.users) {
    throw new Error('Invalid backup format');
  }

  return await prisma.$transaction(async (tx) => {

    await tx.alert.deleteMany();
    await tx.telemetry.deleteMany();
    await tx.eventLog.deleteMany();
    await tx.accessKey.deleteMany();
    await tx.device.deleteMany();
    await tx.room.deleteMany();
    await tx.building.deleteMany();
    await tx.user.deleteMany();

    if (data.users.length) await tx.user.createMany({ data: data.users });
    if (data.buildings.length) await tx.building.createMany({ data: data.buildings });
    if (data.rooms.length) await tx.room.createMany({ data: data.rooms });
    if (data.devices.length) await tx.device.createMany({ data: data.devices });
    if (data.accessKeys.length) await tx.accessKey.createMany({ data: data.accessKeys });
    if (data.eventLogs.length) await tx.eventLog.createMany({ data: data.eventLogs });
    if (data.telemetry.length) await tx.telemetry.createMany({ data: data.telemetry });
    if (data.alerts.length) await tx.alert.createMany({ data: data.alerts });

    return { 
      success: true, 
      restoredCount: {
        users: data.users.length,
        devices: data.devices.length
      } 
    };
  }, {
    timeout: 5000
  });
};