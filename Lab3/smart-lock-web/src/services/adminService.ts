import type { Building, Room } from '../types';
import api from './api';

export const getDashboardStats = async () => {
  const response = await api.get('/dashboard');
  return response.data;
};

export const getDevices = async (category?: string) => {
  const url = category ? `/devices?category=${category}` : '/devices';
  const response = await api.get(url);
  return response.data;
};

export const createDevice = async (deviceData: { serialNumber: string; name: string; roomId: string; category?: string }) => {
  const response = await api.post('/devices', deviceData);
  return response.data;
};

export const updateDevice = async (id: string, deviceData: any) => {
  const response = await api.patch(`/devices/${id}`, deviceData);
  return response.data;
};

export const deleteDevice = async (id: string) => {
  const response = await api.delete(`/devices/${id}`);
  return response.data;
};



export const getDeviceSecret = async (id: string) => {
  const response = await api.get(`/devices/${id}/secret`);
  return response.data;
};

export const issueAccessKey = async (keyData: { userId: string; deviceId: string; validFrom: string; validTo?: string }) => {
  const response = await api.post('/access-keys/issue', keyData);
  return response.data;
};

export const getAuditLogs = async (filters?: { deviceId?: string; userId?: string; type?: string }) => {
  const response = await api.get('/logs', { 
    params: filters 
  });
  return response.data;
};

export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};


export const updateUser = async (id: string, userData: any) => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};



export const revokeAccessKey = async (id: string) => {
  const response = await api.delete(`/access-keys/${id}`);
  return response.data;
};

export const getBuildings = async () => {
  const response = await api.get('/buildings');
  return response.data;
};

export const createBuilding = async (buildingData: { name: string; address: string; description?: string }) => {
  const response = await api.post('/buildings', buildingData);
  return response.data;
};

export const deleteBuilding = async (id: string) => {
  const response = await api.delete(`/buildings/${id}`);
  return response.data;
};


  
export const getAlerts = async (status?: 'NEW' | 'SENT' | 'READ') => {
  const url = status ? `/alerts?status=${status}` : '/alerts';
  const response = await api.get(url);
  return response.data;
};

export const markAlertAsRead = async (id: string) => {
  const response = await api.patch(`/alerts/${id}/read`);
  return response.data;
};


export const getBuildingById = async (id: string): Promise<Building> => {
  const response = await api.get(`/buildings/${id}`);
  return response.data;
};



export const updateBuilding = async (id: string, data: Partial<Building>): Promise<Building> => {
  const response = await api.patch(`/buildings/${id}`, data);
  return response.data;
};

export const getRooms = async (buildingId: string): Promise<Room[]> => {
  const response = await api.get(`/rooms?buildingId=${buildingId}`);
  return response.data;
};

export const getRoomById = async (id: string): Promise<Room> => {
  const response = await api.get(`/rooms/${id}`);
  return response.data;
};

export const createRoom = async (data: Partial<Room>): Promise<Room> => {
  const response = await api.post('/rooms', data);
  return response.data;
};

export const updateRoom = async (id: string, data: Partial<Room>): Promise<Room> => {
  const response = await api.patch(`/rooms/${id}`, data);
  return response.data;
};

export const deleteRoom = async (id: string): Promise<void> => {
  const response = await api.delete(`/rooms/${id}`);
  return response.data;
};