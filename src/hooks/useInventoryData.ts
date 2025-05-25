
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface EquipmentType {
  id: string;
  name: string;
  category: 'cables' | 'gauges' | 'adapters' | 'communication' | 'other';
  description?: string;
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
  lastUpdated: Date;
}

interface InventoryData {
  equipmentTypes: EquipmentType[];
  storageLocations: StorageLocation[];
  equipmentItems: EquipmentItem[];
  lastSync: Date;
}

const DEFAULT_EQUIPMENT_TYPES: EquipmentType[] = [
  { id: '1', name: '100ft Cable', category: 'cables' },
  { id: '2', name: '200ft Cable', category: 'cables' },
  { id: '3', name: '200ft Reel', category: 'cables' },
  { id: '4', name: '300ft Cable (New Version)', category: 'cables' },
  { id: '5', name: '300ft Cable (Old Version)', category: 'cables' },
  { id: '6', name: '300ft Reel', category: 'cables' },
  { id: '7', name: '1502 Pressure Gauge', category: 'gauges' },
  { id: '8', name: 'Pencil Gauge', category: 'gauges' },
  { id: '9', name: 'Y Adapter Cable', category: 'adapters' },
  { id: '10', name: 'Starlink', category: 'communication' },
  { id: '11', name: 'Customer Computer', category: 'communication' },
];

const DEFAULT_STORAGE_LOCATIONS: StorageLocation[] = [
  { id: '1', name: 'Midland Office', isDefault: true },
  { id: '2', name: 'San Antonio Storage Unit', isDefault: false },
  { id: '3', name: 'Houston Office', isDefault: false },
  { id: '4', name: 'Calgary Office', isDefault: false },
];

export const useInventoryData = () => {
  const [data, setData] = useState<InventoryData>({
    equipmentTypes: DEFAULT_EQUIPMENT_TYPES,
    storageLocations: DEFAULT_STORAGE_LOCATIONS,
    equipmentItems: [],
    lastSync: new Date(),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('offline');

  // Initialize default data on first load
  useEffect(() => {
    const initializeData = () => {
      const stored = localStorage.getItem('inventory-data');
      if (stored) {
        try {
          const parsedData = JSON.parse(stored);
          setData({
            ...parsedData,
            lastSync: new Date(parsedData.lastSync),
          });
          setSyncStatus('synced');
        } catch (error) {
          console.error('Failed to parse stored data:', error);
          saveToLocalStorage(data);
        }
      } else {
        // Initialize with default equipment items
        const defaultItems: EquipmentItem[] = DEFAULT_EQUIPMENT_TYPES.map(type => ({
          id: `item-${type.id}`,
          typeId: type.id,
          locationId: '1', // Default to Midland Office
          quantity: Math.floor(Math.random() * 10) + 1, // Random quantity 1-10
          status: 'available' as const,
          lastUpdated: new Date(),
        }));
        
        const initialData = {
          ...data,
          equipmentItems: defaultItems,
        };
        setData(initialData);
        saveToLocalStorage(initialData);
      }
    };

    initializeData();
  }, []);

  const saveToLocalStorage = (dataToSave: InventoryData) => {
    try {
      localStorage.setItem('inventory-data', JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      toast.error('Failed to save data locally');
    }
  };

  const syncData = async () => {
    setIsLoading(true);
    setSyncStatus('syncing');
    
    try {
      // Simulate API call - in real implementation, this would sync with Google Drive
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedData = {
        ...data,
        lastSync: new Date(),
      };
      
      setData(updatedData);
      saveToLocalStorage(updatedData);
      setSyncStatus('synced');
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('offline');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateEquipmentTypes = (types: EquipmentType[]) => {
    const updatedData = { ...data, equipmentTypes: types };
    setData(updatedData);
    saveToLocalStorage(updatedData);
  };

  const updateStorageLocations = (locations: StorageLocation[]) => {
    const updatedData = { ...data, storageLocations: locations };
    setData(updatedData);
    saveToLocalStorage(updatedData);
  };

  const updateEquipmentItems = (items: EquipmentItem[]) => {
    const updatedData = { ...data, equipmentItems: items };
    setData(updatedData);
    saveToLocalStorage(updatedData);
  };

  return {
    data,
    isLoading,
    syncStatus,
    syncData,
    updateEquipmentTypes,
    updateStorageLocations,
    updateEquipmentItems,
  };
};
