import * as eventService from '../services/eventService.js';

export const getAuditLogs = async (req, res, next) => {
  try {
    const filters = {
      deviceId: req.query.deviceId,
      userId: req.query.userId,
      type: req.query.type,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const logs = await eventService.getLogs(filters);
    res.json(logs);
  } catch (error) {
    next(error);
  }
};