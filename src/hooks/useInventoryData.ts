
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { InventoryData, SyncStatus } from '@/types/inventory';
import { useInventoryDefaults } from './inventory/useInventoryDefaults';
import { useInventoryStorage } from './inventory/useInventoryStorage';
import { useInventoryOperations } from './inventory/useInventoryOperations';
import { useInventoryValidation } from './inventory/useInventoryValidation';

// Re-export types for backward compatibility
export type {
  EquipmentType,
  StorageLocation,
  EquipmentItem,
  IndividualEquipment,
  InventoryData
} from '@/types/inventory';

export const useInventoryData = () => {
  const { resetToDefaultInventory, createDefaultInventory, DEFAULT_EQUIPMENT_TYPES, DEFAULT_STORAGE_LOCATIONS } = useInventoryDefaults();
  const { loadFromLocalStorage, saveToLocalStorage, syncData } = useInventoryStorage();
  const { cleanupDuplicateDeployments, ensureMinimumInventory } = useInventoryValidation();

  const [data, setData] = useState<InventoryData>({
    equipmentTypes: DEFAULT_EQUIPMENT_TYPES,
    storageLocations: DEFAULT_STORAGE_LOCATIONS,
    equipmentItems: [],
    individualEquipment: [],
    lastSync: new Date(),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('offline');

  const operations = useInventoryOperations(data, setData);

  // Initialize default data on first load
  useEffect(() => {
    const initializeData = () => {
      const storedData = loadFromLocalStorage();
      if (storedData) {
        // Clean up duplicates and ensure minimum inventory
        storedData.equipmentItems = cleanupDuplicateDeployments(storedData.equipmentItems);
        storedData.equipmentItems = ensureMinimumInventory(storedData.equipmentItems);
        
        setData(storedData);
        saveToLocalStorage(storedData);
        setSyncStatus('synced');
      } else {
        // Initialize with default inventory
        const initialData = {
          equipmentTypes: DEFAULT_EQUIPMENT_TYPES,
          storageLocations: DEFAULT_STORAGE_LOCATIONS,
          equipmentItems: createDefaultInventory(),
          individualEquipment: [],
          lastSync: new Date(),
        };
        setData(initialData);
        saveToLocalStorage(initialData);
      }
    };

    initializeData();
  }, []);

  const handleResetToDefaultInventory = () => {
    const defaultData = resetToDefaultInventory();
    setData(defaultData);
    saveToLocalStorage(defaultData);
    toast.success('Inventory reset to default with 25 pieces of each equipment at Midland Office');
  };

  const handleSyncData = async () => {
    setIsLoading(true);
    setSyncStatus('syncing');
    
    try {
      const updatedData = await syncData(data);
      setData(updatedData);
      setSyncStatus('synced');
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('offline');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Query functions
  const getEquipmentByType = (typeId: string) => {
    return data.equipmentItems.filter(item => item.typeId === typeId);
  };

  const getIndividualEquipmentByType = (typeId: string) => {
    return data.individualEquipment.filter(equipment => equipment.typeId === typeId);
  };

  const getEquipmentByLocation = (locationId: string) => {
    return data.equipmentItems.filter(item => item.locationId === locationId);
  };

  const getIndividualEquipmentByLocation = (locationId: string) => {
    return data.individualEquipment.filter(equipment => equipment.locationId === locationId);
  };

  return {
    data,
    isLoading,
    syncStatus,
    syncData: handleSyncData,
    resetToDefaultInventory: handleResetToDefaultInventory,
    cleanupDuplicateDeployments,
    getEquipmentByType,
    getIndividualEquipmentByType,
    getEquipmentByLocation,
    getIndividualEquipmentByLocation,
    ...operations,
  };
};
