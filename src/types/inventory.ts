
export interface EquipmentType {
  id: string;
  name: string;
  category: 'cables' | 'gauges' | 'adapters' | 'communication' | 'power' | 'other';
  description?: string;
  requiresIndividualTracking: boolean;
  defaultIdPrefix?: string;
}

export interface StorageLocation {
  id: string;
  name: string;
  address?: string;
  isDefault: boolean;
}

export interface EquipmentItem {
  id: string;
  typeId: string;
  locationId: string;
  quantity: number;
  status: 'available' | 'deployed' | 'red-tagged';
  jobId?: string;
  notes?: string;
  redTagReason?: string;
  redTagPhoto?: string;
  location_type?: string;
  lastUpdated: Date;
}

export interface IndividualEquipment {
  id: string;
  equipmentId: string; // User-defined ID like "SS-001"
  name: string; // User-friendly name
  typeId: string;
  locationId: string;
  status: 'available' | 'deployed' | 'maintenance' | 'red-tagged' | 'retired';
  jobId?: string;
  serialNumber?: string;
  purchaseDate?: Date;
  warrantyExpiry?: Date;
  notes?: string;
  redTagReason?: string;
  redTagPhoto?: string;
  location_type?: string;
  lastUpdated: Date;
}

export interface InventoryData {
  equipmentTypes: EquipmentType[];
  storageLocations: StorageLocation[];
  equipmentItems: EquipmentItem[];
  individualEquipment: IndividualEquipment[];
  lastSync: Date;
}

export type SyncStatus = 'synced' | 'syncing' | 'offline';
