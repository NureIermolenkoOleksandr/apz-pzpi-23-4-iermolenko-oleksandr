import * as deviceService from '../services/deviceService.js';
import * as mqttService from '../services/mqttService.js';

export const createDevice = async (req, res, next) => {
  try {
    const { serialNumber, roomId } = req.body;
    if (!serialNumber || !roomId) {
      return res.status(400).json({ error: 'Serial Number and Room ID are required' });
    }
    const device = await deviceService.createDevice(req.body);
    res.status(201).json(device);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Device with this Serial Number already exists' });
    }
    next(error);
  }
};

export const listDevices = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.status) filter.status = req.query.status;
    const devices = await deviceService.getAllDevices(filter);
    res.json(devices);
  } catch (error) {
    next(error);
  }
};

export const updateDevice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body; 

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No update data provided' });
    }

    const updatedDevice = await deviceService.updateDevice(id, updateData);
    res.json(updatedDevice);
  } catch (error) {
    if (error.message === 'Device not found') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};

export const updateConfig = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { config } = req.body;
    if (!config) return res.status(400).json({ error: 'Config object required' });
  
    const updatedDevice = await deviceService.updateDevice(id, { config });
    res.json(updatedDevice);
  } catch (error) {
    next(error);
  }
};

export const remoteOpen = async (req, res, next) => {
  try {
    const { id } = req.params;
    const device = await deviceService.getDeviceById(id);
    if (!device) return res.status(404).json({ error: 'Device not found' });

    mqttService.sendCommand(device.serialNumber, 'OPEN');
    res.json({ success: true, message: `Command OPEN sent to ${device.name}` });
  } catch (error) {
    next(error);
  }
};
export const deleteDevice = async (req, res, next) => {
  try {
    const { id } = req.params;
    await deviceService.deleteDevice(id); 
    res.json({ success: true, message: 'Device deleted successfully' });
  } catch (error) {
    next(error);
  }
};
export const getDeviceSecret = async (req, res, next) => {
  try {
    const { id } = req.params;
    const device = await deviceService.getDeviceById(id);
    if (!device) return res.status(404).json({ error: 'Device not found' });
    res.json({ serialNumber: device.serialNumber, totpSecret: device.totpSecret });
  } catch (error) {
    next(error);
  }
};