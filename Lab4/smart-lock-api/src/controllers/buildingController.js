import * as buildingService from '../services/buildingService.js';

export const listBuildings = async (req, res, next) => {
  try {
    const buildings = await buildingService.getAllBuildings();
    res.json(buildings);
  } catch (error) {
    next(error);
  }
};

export const getBuilding = async (req, res, next) => {
  try {
    const building = await buildingService.getBuildingById(req.params.id);
    if (!building) return res.status(404).json({ error: 'Building not found' });
    res.json(building);
  } catch (error) {
    next(error);
  }
};

export const createBuilding = async (req, res, next) => {
  try {
    if (!req.body.name || !req.body.address) {
      return res.status(400).json({ error: 'Name and address are required' });
    }
    const newBuilding = await buildingService.createBuilding(req.body);
    res.status(201).json(newBuilding);
  } catch (error) {
    next(error);
  }
};

export const updateBuilding = async (req, res, next) => {
  try {
    const updatedBuilding = await buildingService.updateBuilding(req.params.id, req.body);
    res.json(updatedBuilding);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Building not found' });
    }
    next(error);
  }
};

export const deleteBuilding = async (req, res, next) => {
  try {
    await buildingService.deleteBuilding(req.params.id);
    res.json({ success: true, message: 'Building deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Building not found' });
    }
    next(error);
  }
};