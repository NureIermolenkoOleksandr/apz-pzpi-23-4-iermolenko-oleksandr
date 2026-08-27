import api from './api';
import type { AuthResponse } from '../types';

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (email: string, password: string, fullName: string) => {
  const response = await api.post('/auth/register', { 
    email, 
    password, 
    fullName,
    role: 'TENANT' 
  });
  return response.data;
};