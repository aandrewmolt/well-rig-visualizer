
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
  const [isInitialized, setIsInitialized] = useState(false);

  const operations = useInventoryOperations(data, setData);

  // Initialize default data on first load - run cleanup only once
  useEffect(() => {
    if (isInitialized) return;
    
    const initializeData = () => {
      const storedData = loadFromLocalStorage();
      if (storedData) {
        // Merge stored data with updated defaults to ensure we have latest equipment types
        const mergedData = {
          ...storedData,
          equipmentTypes: DEFAULT_EQUIPMENT_TYPES, // Always use latest equipment types
          storageLocations: storedData.storageLocations.length > 0 ? storedData.storageLocations : DEFAULT_STORAGE_LOCATIONS,
        };
        
        // Enhanced cleanup and validation on initialization
        const cleanedItems = cleanupDuplicateDeployments(mergedData.equipmentItems);
        const enhancedItems = ensureMinimumInventory(cleanedItems);
        
        // Only update if cleanup actually changed something
        if (cleanedItems !== mergedData.equipmentItems || enhancedItems !== cleanedItems) {
          const updatedData = { ...mergedData, equipmentItems: enhancedItems };
          setData(updatedData);
          saveToLocalStorage(updatedData);
          console.log('Applied data consistency fixes during initialization');
        } else {
          setData(mergedData);
          saveToLocalStorage(mergedData); // Save merged data
        }
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
        console.log('Initialized with default inventory data');
      }
      setIsInitialized(true);
    };

    initializeData();
  }, []); // Empty dependency array - only run once on mount

  const handleResetToDefaultInventory = () => {
    const defaultData = resetToDefaultInventory();
    setData(defaultData);
    saveToLocalStorage(defaultData);
    toast.success('Inventory reset to default with proper equipment types and tracking');
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
