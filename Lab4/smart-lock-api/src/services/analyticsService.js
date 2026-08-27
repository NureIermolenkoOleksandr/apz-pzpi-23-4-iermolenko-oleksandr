import { prisma } from '../config/db.js';

export const predictBatteryFailure = async (deviceId) => {
  const data = await prisma.telemetry.findMany({
    where: { deviceId, voltage: { not: null } },
    orderBy: { timestamp: 'desc' },
    take: 10
  });

  if (data.length < 5) return { error: 'Not enough data for prediction' };

  const points = data.map(d => ({
    x: new Date(d.timestamp).getTime(),
    y: Number(d.voltage)
  }));

  const n = points.length;
  const sumX = points.reduce((a, b) => a + b.x, 0);
  const sumY = points.reduce((a, b) => a + b.y, 0);
  const sumXY = points.reduce((a, b) => a + b.x * b.y, 0);
  const sumXX = points.reduce((a, b) => a + b.x * b.x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const CRITICAL_VOLTAGE = 4.5;

  if (slope >= 0) return { status: 'Stable', predictedFailureDate: null };


  const failureTime = (CRITICAL_VOLTAGE - intercept) / slope;
  
  return {
    deviceId,
    currentVoltage: points[0].y,
    status: 'Draining',
    predictedFailureDate: new Date(failureTime).toISOString(),
    daysRemaining: Math.floor((failureTime - Date.now()) / (1000 * 60 * 60 * 24))
  };
};

export const calculateUserZScore = async (userId) => {
  const logs = await prisma.eventLog.findMany({
    where: { 
      userId, 
      eventType: 'ACCESS_GRANTED',
      timestamp: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }
  });

  if (logs.length < 10) return { score: 0, status: 'Normal (Low Data)' };

  const loginsPerDay = {};
  logs.forEach(log => {
    const day = log.timestamp.toISOString().split('T')[0];
    loginsPerDay[day] = (loginsPerDay[day] || 0) + 1;
  });

  const counts = Object.values(loginsPerDay);

  const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
  const variance = counts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / counts.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return { score: 0, status: 'Stable' };

  const today = new Date().toISOString().split('T')[0];
  const todayCount = loginsPerDay[today] || 0;

  const zScore = (todayCount - mean) / stdDev;

  let status = 'Normal';
  if (zScore > 3) status = 'Anomaly (High Activity)';
  if (zScore < -3) status = 'Anomaly (Low Activity)'; 

  return {
    userId,
    todayCount,
    averageDaily: mean.toFixed(2),
    zScore: zScore.toFixed(2),
    status
  };
}; 