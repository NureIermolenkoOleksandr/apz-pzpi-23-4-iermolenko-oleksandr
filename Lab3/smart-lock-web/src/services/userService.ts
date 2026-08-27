import api from './api';
import type  { AccessKey } from '../types';

export const getMyKeys = async (): Promise<AccessKey[]> => {
  const response = await api.get('/access-keys/my'); 
  return response.data;
};


export const unlockDoor = async (deviceId: string): Promise<boolean> => {
  try {
    const response = await api.post('/access-keys/unlock', { deviceId });
    return response.data.success;
  } catch (error) {
    console.error("Помилка при відкритті дверей", error);
    return false;
  }
};