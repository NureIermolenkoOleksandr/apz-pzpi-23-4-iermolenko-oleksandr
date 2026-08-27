import * as dashboardService from '../services/dashboardService.js';

export const getDashboard = async (req, res, next) => {
  try {
    const stats = await dashboardService.getStats(req.user);
    res.json(stats);
  } catch (error) {
    next(error);
  }
};