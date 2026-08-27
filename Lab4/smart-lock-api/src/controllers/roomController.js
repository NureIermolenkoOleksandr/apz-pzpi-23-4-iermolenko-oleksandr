import * as roomService from '../services/roomService.js';

export const createRoom = async (req, res, next) => {
  try {
    const { name, buildingId } = req.body;
    if (!name || !buildingId) {
      return res.status(400).json({ error: 'Name and buildingId are required' });
    }
    const room = await roomService.createRoom(req.body);
    res.status(201).json(room);
  } catch (error) {
    next(error);
  }
};

export const getRooms = async (req, res, next) => {
  try {
    const { buildingId } = req.query;
    if (!buildingId) {
        return res.status(400).json({ error: 'Please provide buildingId query param' });
    }
    const rooms = await roomService.getRoomsByBuilding(buildingId);
    res.json(rooms);
  } catch (error) {
    next(error);
  }
};

export const getRoomById = async (req, res, next) => {
  try {
    const room = await roomService.getRoomById(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (error) {
    next(error);
  }
};

export const updateRoom = async (req, res, next) => {
  try {
    const updatedRoom = await roomService.updateRoom(req.params.id, req.body);
    res.json(updatedRoom);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Room not found' });
    }
    next(error);
  }
};

export const deleteRoom = async (req, res, next) => {
  try {
    await roomService.deleteRoom(req.params.id);
    res.json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Room not found' });
    }
    next(error);
  }
};