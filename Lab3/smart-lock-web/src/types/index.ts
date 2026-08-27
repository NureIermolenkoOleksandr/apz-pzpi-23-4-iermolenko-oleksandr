export interface User {
  id: string;
  email: string;
  fullName: string | null;
  role: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'MANAGER' | 'SECURITY' | 'MAINTENANCE' | 'TENANT' | 'AUDITOR';
  isActive: boolean;
}

export interface BuildingInfo {
  id: string;
  name: string;
}

export interface RoomInfo {
  id: string; 
  name: string;
  buildingId: string; 
  building?: BuildingInfo;
}

export interface Building {
  id: string;
  name: string;
  address: string;
  description?: string;
  managerId?: string;
  rooms?: Room[];
  createdAt?: string;
}

export interface Room {
  id: string;
  name: string;
  floorNumber: number;
  areaSqm?: number;
  isRestricted: boolean;
  buildingId: string;
  createdAt?: string;
  devices?: any[];
}

export interface Device {
  id: string;
  name: string | null;
  category?: string;
  serialNumber: string;
  status: string;
  totpSecret?: string;
  roomId: string; 
  room?: RoomInfo;
}


export interface AccessKey {
  id: string;
  validFrom: string;
  validTo: string | null;
  isActive: boolean;
  device?: Device;
  user?: User;
}

export interface AuthResponse {
  token: string;
  user: User;
}

