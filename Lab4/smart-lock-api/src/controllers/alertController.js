import * as alertService from '../services/alertService.js';

export const getAlerts = async (req, res, next) => {
  try {
    const { status } = req.query; // NEW, SENT, READ
    const alerts = await alertService.getAlerts(status);
    res.json(alerts);
  } catch (error) {
    next(error);
  }
};

export const markRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    await alertService.markAsRead(id);
    res.json({ message: 'Alert marked as read' });
  } catch (error) {
    next(error);
  }
};