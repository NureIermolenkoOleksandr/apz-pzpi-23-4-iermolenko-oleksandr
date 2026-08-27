import * as analyticsService from '../services/analyticsService.js';

export const getBatteryPrediction = async (req, res, next) => {
  try {
    const { deviceId } = req.params;
    const prediction = await analyticsService.predictBatteryFailure(deviceId);
    res.json(prediction);
  } catch (error) {
    next(error);
  }
};

export const getUserRiskScore = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const analysis = await analyticsService.calculateUserZScore(userId);
    res.json(analysis);
  } catch (error) {
    next(error);
  }
};