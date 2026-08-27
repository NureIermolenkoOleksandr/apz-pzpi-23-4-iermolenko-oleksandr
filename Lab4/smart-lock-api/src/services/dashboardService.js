import { prisma } from '../config/db.js';

export const getStats = async (user) => {
  const { role, id: userId } = user;

  if (role === 'SUPER_ADMIN') {
    const [totalUsers, totalBuildings, totalDevices, activeAlerts] = await Promise.all([
      prisma.user.count(),
      prisma.building.count(),
      prisma.device.count(),
      prisma.alert.count({ where: { status: 'NEW' } })
    ]);

    const deviceStatusStats = await prisma.device.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    const recentLogs = await prisma.eventLog.findMany({
      take: 10,
      orderBy: { timestamp: 'desc' },
      include: { user: { select: { email: true } }, device: { select: { name: true } } }
    });

    return {
      role,
      summary: { totalUsers, totalBuildings, totalDevices, activeAlerts },
      chartData: { deviceStatus: deviceStatusStats },
      recentActivity: recentLogs
    };
  }

  if (role === 'ORG_ADMIN' || role === 'MANAGER') {
    const myBuildings = await prisma.building.findMany({
      where: { managerId: userId },
      select: { id: true }
    });
    
    const buildingIds = myBuildings.map(b => b.id);

    const deviceCount = await prisma.device.count({
      where: { room: { buildingId: { in: buildingIds } } }
    });

    const activeKeys = await prisma.accessKey.count({
      where: { device: { room: { buildingId: { in: buildingIds } } }, isActive: true }
    });

    return {
      role,
      summary: {
        managedBuildings: buildingIds.length,
        totalDevices: deviceCount,
        activeKeysIssued: activeKeys
      },
      criticalDevices: await prisma.device.findMany({
        where: { 
          room: { buildingId: { in: buildingIds } },
          OR: [{ status: 'OFFLINE' }, { batteryLevel: { lte: 20 } }]
        },
        select: { name: true, status: true, batteryLevel: true }
      })
    };
  }

  if (role === 'MAINTENANCE') {
    const lowBattery = await prisma.device.count({
      where: { batteryLevel: { lte: 20 } }
    });

    const offlineDevices = await prisma.device.count({
      where: { status: 'OFFLINE' }
    });

    const recentAlerts = await prisma.alert.findMany({
      where: { status: { not: 'READ' } }, 
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { device: { select: { name: true, room: { select: { name: true } } } } }
    });

    return {
      role,
      technicalSummary: { lowBatteryDevices: lowBattery, offlineDevices },
      workQueue: recentAlerts
    };
  }

  if (role === 'SECURITY') {
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);

    const violationsToday = await prisma.eventLog.count({
      where: { 
        timestamp: { gte: todayStart },
        eventType: { in: ['ACCESS_DENIED', 'DOOR_FORCED', 'ANOMALY_DETECTED'] }
      }
    });

    const activeAlerts = await prisma.alert.findMany({
      where: { type: 'SECURITY_BREACH', status: 'NEW' },
      include: { device: true }
    });

    return {
      role,
      securitySummary: { violationsToday, activeBreaches: activeAlerts.length },
      alerts: activeAlerts
    };
  }

  const myKeys = await prisma.accessKey.findMany({
    where: { userId, isActive: true },
    include: { device: { select: { name: true, status: true } } }
  });

  const myHistory = await prisma.eventLog.findMany({
    where: { userId },
    take: 5,
    orderBy: { timestamp: 'desc' },
    select: { eventType: true, timestamp: true, device: { select: { name: true } } }
  });

  return {
    role,
    myAccess: myKeys,
    recentHistory: myHistory
  };
};