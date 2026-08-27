import * as telemetryService from '../services/telemetryService.js';

export const reportTelemetry = async (req, res, next) => {
  try {
    const { deviceId, voltage, percentage } = req.body;
    
    if (!deviceId) {
      return res.status(400).json({ error: 'deviceId is required' });
    }

    const record = await telemetryService.addTelemetry(req.body);
    res.status(201).json(record);
  } catch (error) {
    if (error.code === 'P2003') {
      return res.status(404).json({ error: 'Device not found' });
    }
    next(error);
  }
};

export const getHistory = async (req, res, next) => {
  try {
    const { deviceId } = req.params;
    const { limit } = req.query;
    
    const history = await telemetryService.getDeviceTelemetry(deviceId, limit);
    res.json(history);
  } catch (error) {
    next(error);
  }
};