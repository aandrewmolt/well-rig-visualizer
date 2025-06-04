
import { InventoryData } from '@/types/inventory';

export interface InventoryContextType {
  data: InventoryData;
  isLoading: boolean;
  syncStatus: 'synced' | 'syncing' | 'offline';
  
  // CRUD operations
  updateSingleEquipmentItem: (id: string, updates: any) => Promise<void>;
  addEquipmentItem: (item: any) => Promise<void>;
  deleteEquipmentItem: (id: string) => Promise<any>;
  deleteEquipmentType: (id: string) => Promise<any>;
  deleteStorageLocation: (id: string) => Promise<any>;
  
  // All mutation operations
  addEquipmentType: (data: any) => Promise<void>;
  updateEquipmentType: (id: string, data: any) => Promise<void>;
  addStorageLocation: (data: any) => Promise<void>;
  updateStorageLocation: (id: string, data: any) => Promise<void>;
  addIndividualEquipment: (data: any) => Promise<void>;
  updateIndividualEquipment: (id: string, data: any) => Promise<void>;
  
  // Bulk operations
  addBulkIndividualEquipment: (equipment: any[]) => Promise<any[]>;
  
  // Utilities and other methods
  getEquipmentTypeName: (typeId: string) => string;
  getLocationName: (locationId: string) => string;
  getEquipmentByLocation: (locationId: string) => any[];
  getIndividualEquipmentByLocation: (locationId: string) => any[];
  getTotalQuantityByType: (typeId: string) => number;
  getAvailableQuantityByType: (typeId: string) => number;
  getDeployedQuantityByType: (typeId: string) => number;
  
  // Legacy compatibility
  createEquipmentType: (data: any) => Promise<void>;
  createStorageLocation: (data: any) => Promise<void>;
  updateSingleIndividualEquipment: (id: string, data: any) => Promise<void>;
  updateEquipmentTypes: (id: string, data: any) => Promise<void>;
  updateStorageLocations: (id: string, data: any) => Promise<void>;
  updateEquipmentItems: (id: string, data: any) => Promise<void>;
  syncData: () => Promise<InventoryData>;
  resetToDefaultInventory: () => void;
  cleanupDuplicateDeployments: () => any[];
}
